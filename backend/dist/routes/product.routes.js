import { Router } from 'express';
import { getProductsController, getProductController, createProductController, updateProductController, deleteProductController, createVariantController, updateVariantController, deleteVariantController, } from '../controllers/product.controller.js';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
const router = Router();
router.get('/products', getProductsController);
router.get('/products/:id', getProductController);
router.post('/products', verifyTokenMiddleware, requireRole(Role.ADMIN), createProductController);
router.put('/products/:id', verifyTokenMiddleware, requireRole(Role.ADMIN), updateProductController);
router.delete('/products/:id', verifyTokenMiddleware, requireRole(Role.ADMIN), deleteProductController);
router.post('/products/:id/variants', verifyTokenMiddleware, requireRole(Role.ADMIN), createVariantController);
router.put('/variants/:id', verifyTokenMiddleware, requireRole(Role.ADMIN), updateVariantController);
router.delete('/variants/:id', verifyTokenMiddleware, requireRole(Role.ADMIN), deleteVariantController);
export default router;
//# sourceMappingURL=product.routes.js.map