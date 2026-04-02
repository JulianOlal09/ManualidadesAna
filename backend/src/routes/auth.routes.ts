import { Router } from 'express';
import { registerController, loginController, meController } from '../controllers/auth.controller.js';
import { verifyTokenMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/me', verifyTokenMiddleware, requireRole(Role.CLIENT, Role.ADMIN), meController);

export default router;
