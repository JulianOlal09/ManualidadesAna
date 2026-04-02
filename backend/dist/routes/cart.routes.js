import { Router } from 'express';
import { getCartController, addToCartController, updateCartItemController, removeFromCartController, clearCartController, validateCartController, } from '../controllers/cart.controller.js';
import { verifyTokenMiddleware } from '../middlewares/auth.middleware.js';
const router = Router();
router.use(verifyTokenMiddleware);
router.get('/cart', getCartController);
router.get('/cart/validate', validateCartController);
router.post('/cart/items', addToCartController);
router.put('/cart/items/:productId', updateCartItemController);
router.delete('/cart/items/:productId', removeFromCartController);
router.delete('/cart', clearCartController);
export default router;
//# sourceMappingURL=cart.routes.js.map