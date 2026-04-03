import { Router } from 'express';
import { registerController, loginController, meController, updateProfileController, deleteAccountController } from '../controllers/auth.controller.js';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/me', verifyTokenMiddleware, requireRole(Role.CLIENT, Role.ADMIN), meController);
router.put('/profile', verifyTokenMiddleware, requireRole(Role.CLIENT, Role.ADMIN), updateProfileController);
router.delete('/account', verifyTokenMiddleware, requireRole(Role.CLIENT, Role.ADMIN), deleteAccountController);

export default router;
