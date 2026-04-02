import { Router } from 'express';
import { getCategoriesController, getCategoryController, createCategoryController, updateCategoryController, deleteCategoryController, } from '../controllers/category.controller.js';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
const router = Router();
router.get('/categories', getCategoriesController);
router.get('/categories/:id', getCategoryController);
router.post('/categories', verifyTokenMiddleware, requireRole(Role.ADMIN), createCategoryController);
router.put('/categories/:id', verifyTokenMiddleware, requireRole(Role.ADMIN), updateCategoryController);
router.delete('/categories/:id', verifyTokenMiddleware, requireRole(Role.ADMIN), deleteCategoryController);
export default router;
//# sourceMappingURL=category.routes.js.map