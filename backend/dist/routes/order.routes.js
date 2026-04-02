import { Router } from 'express';
import { createOrderController, getUserOrdersController, getUserOrderController, getAllOrdersController, getOrderByIdController, updateOrderStatusController, getOrderStatsController, } from '../controllers/order.controller.js';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
const router = Router();
router.use(verifyTokenMiddleware);
router.post('/orders', createOrderController);
router.get('/orders', getUserOrdersController);
router.get('/orders/:id', getUserOrderController);
router.get('/admin/orders/stats', requireRole(Role.ADMIN), getOrderStatsController);
router.get('/admin/orders', requireRole(Role.ADMIN), getAllOrdersController);
router.get('/admin/orders/:id', requireRole(Role.ADMIN), getOrderByIdController);
router.put('/orders/:id/status', requireRole(Role.ADMIN), updateOrderStatusController);
export default router;
//# sourceMappingURL=order.routes.js.map