import { Router } from 'express';
import multer from 'multer';
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
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/products', getProductsController);
router.get('/products/:id', getProductController);

router.post('/products', verifyTokenMiddleware, requireRole(Role.ADMIN), upload.single('image'), createProductController);
router.put('/products/:id', verifyTokenMiddleware, requireRole(Role.ADMIN), upload.single('image'), updateProductController);
router.delete('/products/:id', verifyTokenMiddleware, requireRole(Role.ADMIN), deleteProductController);
router.patch('/products/:id/toggle-active', verifyTokenMiddleware, requireRole(Role.ADMIN), toggleProductActiveController);

export default router;