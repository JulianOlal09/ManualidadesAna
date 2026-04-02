import { Router } from 'express';
import {
  getProductsController,
  getProductController,
  createProductController,
  updateProductController,
  deleteProductController,
  toggleProductActiveController,
} from '../controllers/product.controller.js';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.get('/products', getProductsController);
router.get('/products/:id', getProductController);

router.post('/products', verifyTokenMiddleware, requireRole(Role.ADMIN), createProductController);
router.put('/products/:id', verifyTokenMiddleware, requireRole(Role.ADMIN), updateProductController);
router.delete('/products/:id', verifyTokenMiddleware, requireRole(Role.ADMIN), deleteProductController);
router.patch('/products/:id/toggle-active', verifyTokenMiddleware, requireRole(Role.ADMIN), toggleProductActiveController);

export default router;