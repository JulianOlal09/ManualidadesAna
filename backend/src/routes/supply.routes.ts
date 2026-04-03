import { Router } from 'express';
import {
  getSuppliesController,
  getSupplyController,
  getSupplyStatsController,
  createSupplyController,
  updateSupplyController,
  deleteSupplyController,
} from '../controllers/supply.controller.js';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(verifyTokenMiddleware);
router.use(requireRole(Role.ADMIN));

router.get('/admin/supplies', getSuppliesController);
router.get('/admin/supplies/stats', getSupplyStatsController);
router.get('/admin/supplies/:id', getSupplyController);
router.post('/admin/supplies', createSupplyController);
router.put('/admin/supplies/:id', updateSupplyController);
router.delete('/admin/supplies/:id', deleteSupplyController);

export default router;