import { Router } from 'express';
import {
  getInventoryController,
  getProductInventoryController,
  adjustStockController,
  getLowStockAlertsController,
  getInventoryStatsController,
} from '../controllers/inventory.controller.js';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(verifyTokenMiddleware);
router.use(requireRole(Role.ADMIN));

router.get('/admin/inventory', getInventoryController);
router.get('/admin/inventory/stats', getInventoryStatsController);
router.get('/admin/inventory/alerts', getLowStockAlertsController);
router.get('/admin/inventory/:productId', getProductInventoryController);
router.post('/admin/inventory/:productId', adjustStockController);

export default router;