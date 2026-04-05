import { Router } from 'express';
import {
  createOrderController,
  getUserOrdersController,
  getUserOrderController,
  getAllOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
  getOrderStatsController,
  updateOrderItemsController,
  cancelOrderController,
  getSalesByMonthController,
} from '../controllers/order.controller.js';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

// Todas las rutas de pedidos requieren autenticación
router.use(verifyTokenMiddleware);

// ==================== RUTAS DE CLIENTE ====================

// POST /api/orders - Crear pedido desde carrito
router.post('/orders', createOrderController);

// GET /api/orders - Listar pedidos del usuario
router.get('/orders', getUserOrdersController);

// GET /api/orders/:id - Ver detalle de pedido del usuario
router.get('/orders/:id', getUserOrderController);

// PUT /api/orders/:id - Actualizar items del pedido
router.put('/orders/:id', updateOrderItemsController);

// DELETE /api/orders/:id - Cancelar pedido
router.delete('/orders/:id', cancelOrderController);

// ==================== RUTAS DE ADMIN ====================

// GET /api/admin/orders/stats - Estadísticas de pedidos
router.get('/admin/orders/stats', requireRole(Role.ADMIN), getOrderStatsController);

// GET /api/admin/orders/sales-by-month - Ventas por mes
router.get('/admin/orders/sales-by-month', requireRole(Role.ADMIN), getSalesByMonthController);

// GET /api/admin/orders - Listar todos los pedidos
router.get('/admin/orders', requireRole(Role.ADMIN), getAllOrdersController);

// GET /api/admin/orders/:id - Ver cualquier pedido por ID (admin override)
router.get('/admin/orders/:id', requireRole(Role.ADMIN), getOrderByIdController);

// PUT /api/admin/orders/:id/status - Actualizar estado de pedido
router.put('/admin/orders/:id/status', requireRole(Role.ADMIN), updateOrderStatusController);

export default router;
