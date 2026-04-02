import { prisma } from '../lib/prisma.js';
export async function getCart(userId) {
    return prisma.cartItem.findMany({
        where: { userId },
        include: {
            variant: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}
export async function addToCart(input) {
    const { userId, variantId, quantity } = input;
    if (quantity <= 0) {
        throw new Error('INVALID_QUANTITY');
    }
    const variant = await prisma.variant.findFirst({
        where: {
            id: variantId,
            isActive: true,
        },
        include: {
            product: true,
        },
    });
    if (!variant) {
        throw new Error('VARIANT_NOT_FOUND');
    }
    if (!variant.product.isActive) {
        throw new Error('PRODUCT_NOT_ACTIVE');
    }
    if (variant.stock < quantity) {
        throw new Error('INSUFFICIENT_STOCK');
    }
    const existingItem = await prisma.cartItem.findUnique({
        where: {
            userId_variantId: {
                userId,
                variantId,
            },
        },
    });
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (variant.stock < newQuantity) {
            throw new Error('INSUFFICIENT_STOCK');
        }
        return prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
        });
    }
    return prisma.cartItem.create({
        data: {
            userId,
            variantId,
            quantity,
        },
    });
}
export async function updateCartItem(userId, variantId, input) {
    const { quantity } = input;
    if (quantity <= 0) {
        throw new Error('INVALID_QUANTITY');
    }
    const cartItem = await prisma.cartItem.findUnique({
        where: {
            userId_variantId: {
                userId,
                variantId,
            },
        },
        include: {
            variant: true,
        },
    });
    if (!cartItem) {
        throw new Error('CART_ITEM_NOT_FOUND');
    }
    if (!cartItem.variant.isActive) {
        throw new Error('VARIANT_NOT_ACTIVE');
    }
    if (cartItem.variant.stock < quantity) {
        throw new Error('INSUFFICIENT_STOCK');
    }
    return prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity },
    });
}
export async function removeFromCart(userId, variantId) {
    const cartItem = await prisma.cartItem.findUnique({
        where: {
            userId_variantId: {
                userId,
                variantId,
            },
        },
    });
    if (!cartItem) {
        throw new Error('CART_ITEM_NOT_FOUND');
    }
    await prisma.cartItem.delete({
        where: { id: cartItem.id },
    });
}
export async function clearCart(userId) {
    await prisma.cartItem.deleteMany({
        where: { userId },
    });
}
export async function validateCartStock(userId) {
    const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
            variant: {
                include: {
                    product: true,
                },
            },
        },
    });
    const errors = [];
    for (const item of cartItems) {
        if (!item.variant.product.isActive) {
            errors.push({
                variantId: item.variantId,
                message: 'Product is no longer active',
            });
            continue;
        }
        if (!item.variant.isActive) {
            errors.push({
                variantId: item.variantId,
                message: 'Variant is no longer active',
            });
            continue;
        }
        if (item.variant.stock < item.quantity) {
            errors.push({
                variantId: item.variantId,
                message: `Insufficient stock. Available: ${item.variant.stock}, Requested: ${item.quantity}`,
            });
        }
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
//# sourceMappingURL=cart.service.js.map