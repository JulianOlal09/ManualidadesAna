import { Router } from 'express';
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
  validateCartController,
} from '../controllers/cart.controller.js';
import { verifyTokenMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas del carrito requieren autenticación
router.use(verifyTokenMiddleware);

// GET /api/cart - Obtener carrito
router.get('/cart', getCartController);

// GET /api/cart/validate - Validar stock del carrito
router.get('/cart/validate', validateCartController);

// POST /api/cart/items - Agregar item al carrito
router.post('/cart/items', addToCartController);

// PUT /api/cart/items/:productId - Actualizar cantidad de un item
router.put('/cart/items/:productId', updateCartItemController);

// DELETE /api/cart/items/:productId - Eliminar item del carrito
router.delete('/cart/items/:productId', removeFromCartController);

// DELETE /api/cart - Vaciar carrito completo
router.delete('/cart', clearCartController);

export default router;
