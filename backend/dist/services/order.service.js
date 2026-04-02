import { prisma } from '../lib/prisma.js';
import { OrderStatus } from '@prisma/client';
export async function createOrderFromCart(input) {
    const { userId } = input;
    return await prisma.$transaction(async (tx) => {
        const cartItems = await tx.cartItem.findMany({
            where: { userId },
            include: {
                product: true,
            },
        });
        if (cartItems.length === 0) {
            throw new Error('CART_EMPTY');
        }
        const errors = [];
        for (const item of cartItems) {
            if (!item.product.isActive) {
                errors.push({
                    productId: item.productId,
                    message: `Product "${item.product.name}" is no longer active`,
                });
                continue;
            }
            if (item.product.stock < item.quantity) {
                errors.push({
                    productId: item.productId,
                    message: `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}, Requested: ${item.quantity}`,
                });
            }
        }
        if (errors.length > 0) {
            throw new Error(JSON.stringify({ code: 'VALIDATION_ERRORS', errors }));
        }
        let totalAmount = 0;
        for (const item of cartItems) {
            const price = Number(item.product.price);
            totalAmount += price * item.quantity;
        }
        const order = await tx.order.create({
            data: {
                userId,
                totalAmount,
                status: OrderStatus.PENDIENTE,
            },
        });
        const orderItemsData = cartItems.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
        }));
        await tx.orderItem.createMany({
            data: orderItemsData,
        });
        for (const item of cartItems) {
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }
        await tx.cartItem.deleteMany({
            where: { userId },
        });
        const orderWithRelations = await tx.order.findUnique({
            where: { id: order.id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
        if (!orderWithRelations) {
            throw new Error('ORDER_NOT_FOUND');
        }
        return orderWithRelations;
    });
}
export async function getOrdersByUser(userId) {
    return prisma.order.findMany({
        where: { userId },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}
export async function getOrderById(orderId, userId) {
    const whereClause = { id: orderId };
    if (userId !== undefined) {
        whereClause.userId = userId;
    }
    return prisma.order.findFirst({
        where: whereClause,
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
    });
}
export async function getAllOrders() {
    return prisma.order.findMany({
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}
export async function updateOrderStatus(orderId, input) {
    const { status } = input;
    return await prisma.$transaction(async (tx) => {
        const existingOrder = await tx.order.findUnique({
            where: { id: orderId },
            include: {
                items: true,
            },
        });
        if (!existingOrder) {
            throw new Error('ORDER_NOT_FOUND');
        }
        const validTransitions = {
            PENDIENTE: [OrderStatus.ENVIADO, OrderStatus.CANCELADO],
            ENVIADO: [OrderStatus.ENTREGADO, OrderStatus.CANCELADO],
            ENTREGADO: [],
            CANCELADO: [],
        };
        const allowedStatuses = validTransitions[existingOrder.status];
        if (!allowedStatuses.includes(status)) {
            throw new Error('INVALID_STATUS_TRANSITION');
        }
        if (status === OrderStatus.CANCELADO) {
            for (const item of existingOrder.items) {
                if (item.productId) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.quantity,
                            },
                        },
                    });
                }
            }
        }
        return tx.order.update({
            where: { id: orderId },
            data: { status },
        });
    });
}
export async function getOrderStats() {
    const [total, pendientes, enviados, entregados, cancelados] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: OrderStatus.PENDIENTE } }),
        prisma.order.count({ where: { status: OrderStatus.ENVIADO } }),
        prisma.order.count({ where: { status: OrderStatus.ENTREGADO } }),
        prisma.order.count({ where: { status: OrderStatus.CANCELADO } }),
    ]);
    return {
        total,
        pendientes,
        enviados,
        entregados,
        cancelados,
    };
}
//# sourceMappingURL=order.service.js.map