import express, { Request, Response } from 'express';
import { Resend } from 'resend';
import { verifyTokenMiddleware, AuthRequest, verifyAdminMiddleware } from '../middlewares/auth.middleware.js';
import { prisma } from '../lib/prisma.js';
import logger from '../utils/logger.js';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.get('/test', (_req: Request, res: Response) => {
  res.json({ message: 'test route works!' });
});

router.get('/mis-pedidos', verifyTokenMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
        },
      });
      return;
    }

    const customOrders = await prisma.customOrder.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: customOrders,
    });
  } catch (error) {
    logger.error('Error fetching custom orders', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener los pedidos',
      },
    });
  }
});

router.post('/pedido', verifyTokenMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
        },
      });
      return;
    }

    if (!message) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'El mensaje es requerido',
        },
      });
      return;
    }

    // Obtener datos del usuario desde la base de datos
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado',
        },
      });
      return;
    }

    // Crear registro en la base de datos
    const customOrder = await prisma.customOrder.create({
      data: {
        userId,
        message,
        status: 'PENDING',
      },
    });

    // Enviar email de notificación
    const toEmail = process.env.CONTACT_FORM_TO_EMAIL || 'manualidadesana123@gmail.com';
    
    await resend.emails.send({
      from: 'Pedidos Personalizados <onboarding@resend.dev>',
      to: toEmail,
      subject: `Nuevo pedido personalizado de ${user.name}`,
      html: `
        <h2>Nuevo Pedido Personalizado #${customOrder.id}</h2>
        <p><strong>Nombre:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Teléfono:</strong> ${user.phone || 'No proporcionado'}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'Pedido enviado correctamente',
      data: {
        id: customOrder.id,
        status: customOrder.status,
        createdAt: customOrder.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error sending contact email', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al enviar el pedido',
      },
    });
  }
});

// ============= ADMIN ROUTES =============

// Get all custom orders (admin only)
router.get('/admin/all', verifyTokenMiddleware, verifyAdminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const status = req.query.status as string | undefined;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [customOrders, total] = await Promise.all([
      prisma.customOrder.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customOrder.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: customOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching custom orders (admin)', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al obtener los pedidos personalizados',
      },
    });
  }
});

// Update custom order status (admin only)
router.patch('/admin/:id/status', verifyTokenMiddleware, verifyAdminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONTACTED', 'COMPLETED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Estado inválido',
        },
      });
      return;
    }

    const customOrder = await prisma.customOrder.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: customOrder,
    });
  } catch (error) {
    logger.error('Error updating custom order status', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al actualizar el estado',
      },
    });
  }
});

export default router;
