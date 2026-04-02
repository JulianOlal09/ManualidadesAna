import { Request, Response, NextFunction } from 'express';
import {
  createOrderFromCart,
  getOrdersByUser,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} from '../services/order.service.js';
import { OrderStatus } from '@prisma/client';

/**
 * POST /api/orders
 * Crear un pedido desde el carrito del usuario autenticado
 */
export async function createOrderController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const order = await createOrderFromCart({ userId });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'CART_EMPTY') {
        res.status(400).json({
          success: false,
          error: {
            code: 'CART_EMPTY',
            message: 'Cannot create order from empty cart',
          },
        });
        return;
      }

      // Manejar errores de validación múltiples
      if (error.message.startsWith('{')) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.code === 'VALIDATION_ERRORS') {
            res.status(400).json({
              success: false,
              error: {
                code: 'VALIDATION_ERRORS',
                message: 'Some items in your cart are not available',
                details: errorData.errors,
              },
            });
            return;
          }
        } catch {
          // Si no es JSON válido, continuar al siguiente error handler
        }
      }
    }
    next(error);
  }
}

/**
 * GET /api/orders
 * Obtener todos los pedidos del usuario autenticado
 */
export async function getUserOrdersController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const orders = await getOrdersByUser(userId);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/:id
 * Obtener un pedido específico del usuario autenticado
 */
export async function getUserOrderController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const orderIdParam = req.params.id;

    if (!orderIdParam || typeof orderIdParam !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid order ID parameter',
        },
      });
      return;
    }

    const orderId = parseInt(orderIdParam, 10);

    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid order ID',
        },
      });
      return;
    }

    // Buscar pedido del usuario específico
    const order = await getOrderById(orderId, userId);

    if (!order) {
      res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/orders
 * Obtener todos los pedidos (solo ADMIN)
 */
export async function getAllOrdersController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orders = await getAllOrders();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/:id (ADMIN)
 * Obtener cualquier pedido por ID (solo ADMIN)
 */
export async function getOrderByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orderIdParam = req.params.id;

    if (!orderIdParam || typeof orderIdParam !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid order ID parameter',
        },
      });
      return;
    }

    const orderId = parseInt(orderIdParam, 10);

    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid order ID',
        },
      });
      return;
    }

    // Admin puede ver cualquier pedido (sin filtrar por userId)
    const order = await getOrderById(orderId);

    if (!order) {
      res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/orders/:id/status
 * Actualizar el estado de un pedido (solo ADMIN)
 */
export async function updateOrderStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orderIdParam = req.params.id;

    if (!orderIdParam || typeof orderIdParam !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid order ID parameter',
        },
      });
      return;
    }

    const orderId = parseInt(orderIdParam, 10);

    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid order ID',
        },
      });
      return;
    }

    const { status } = req.body;

    // Validar que el status sea un valor válido del enum
    if (!status || typeof status !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status is required',
        },
      });
      return;
    }

    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status as OrderStatus)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
        },
      });
      return;
    }

    const order = await updateOrderStatus(orderId, { status: status as OrderStatus });

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ORDER_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found',
          },
        });
        return;
      }

      if (error.message === 'INVALID_STATUS_TRANSITION') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS_TRANSITION',
            message: 'Invalid status transition',
          },
        });
        return;
      }
    }
    next(error);
  }
}

/**
 * GET /api/admin/orders/stats
 * Obtener estadísticas de pedidos (solo ADMIN)
 */
export async function getOrderStatsController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await getOrderStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
