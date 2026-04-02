import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, validateCartStock, } from '../services/cart.service.js';
export async function getCartController(req, res, next) {
    try {
        const userId = req.user.userId;
        const cart = await getCart(userId);
        res.status(200).json({
            success: true,
            data: cart,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function addToCartController(req, res, next) {
    try {
        const userId = req.user.userId;
        const { productId, quantity } = req.body;
        if (!productId || typeof productId !== 'number' || isNaN(productId)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Valid productId is required',
                },
            });
            return;
        }
        if (!quantity || typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Quantity must be a positive number',
                },
            });
            return;
        }
        const cartItem = await addToCart({
            userId,
            productId,
            quantity,
        });
        res.status(201).json({
            success: true,
            data: cartItem,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'PRODUCT_NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'PRODUCT_NOT_FOUND',
                        message: 'Product not found or inactive',
                    },
                });
                return;
            }
            if (error.message === 'PRODUCT_NOT_ACTIVE') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'PRODUCT_NOT_ACTIVE',
                        message: 'Product is not active',
                    },
                });
                return;
            }
            if (error.message === 'INSUFFICIENT_STOCK') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INSUFFICIENT_STOCK',
                        message: 'Insufficient stock for the requested quantity',
                    },
                });
                return;
            }
            if (error.message === 'INVALID_QUANTITY') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_QUANTITY',
                        message: 'Quantity must be greater than 0',
                    },
                });
                return;
            }
        }
        next(error);
    }
}
export async function updateCartItemController(req, res, next) {
    try {
        const userId = req.user.userId;
        const productIdParam = req.params.productId;
        if (!productIdParam || typeof productIdParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid productId parameter',
                },
            });
            return;
        }
        const productId = parseInt(productIdParam, 10);
        const { quantity } = req.body;
        if (isNaN(productId)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid productId',
                },
            });
            return;
        }
        if (!quantity || typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Quantity must be a positive number',
                },
            });
            return;
        }
        const cartItem = await updateCartItem(userId, productId, { quantity });
        res.status(200).json({
            success: true,
            data: cartItem,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'CART_ITEM_NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'CART_ITEM_NOT_FOUND',
                        message: 'Item not found in cart',
                    },
                });
                return;
            }
            if (error.message === 'PRODUCT_NOT_ACTIVE') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'PRODUCT_NOT_ACTIVE',
                        message: 'Product is no longer active',
                    },
                });
                return;
            }
            if (error.message === 'INSUFFICIENT_STOCK') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INSUFFICIENT_STOCK',
                        message: 'Insufficient stock for the requested quantity',
                    },
                });
                return;
            }
            if (error.message === 'INVALID_QUANTITY') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_QUANTITY',
                        message: 'Quantity must be greater than 0',
                    },
                });
                return;
            }
        }
        next(error);
    }
}
export async function removeFromCartController(req, res, next) {
    try {
        const userId = req.user.userId;
        const productIdParam = req.params.productId;
        if (!productIdParam || typeof productIdParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid productId parameter',
                },
            });
            return;
        }
        const productId = parseInt(productIdParam, 10);
        if (isNaN(productId)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid productId',
                },
            });
            return;
        }
        await removeFromCart(userId, productId);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof Error && error.message === 'CART_ITEM_NOT_FOUND') {
            res.status(404).json({
                success: false,
                error: {
                    code: 'CART_ITEM_NOT_FOUND',
                    message: 'Item not found in cart',
                },
            });
            return;
        }
        next(error);
    }
}
export async function clearCartController(req, res, next) {
    try {
        const userId = req.user.userId;
        await clearCart(userId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}
export async function validateCartController(req, res, next) {
    try {
        const userId = req.user.userId;
        const validation = await validateCartStock(userId);
        res.status(200).json({
            success: true,
            data: validation,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=cart.controller.js.map