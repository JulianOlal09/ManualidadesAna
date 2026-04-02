import { createOrderFromCart, getOrdersByUser, getOrderById, getAllOrders, updateOrderStatus, getOrderStats, } from '../services/order.service.js';
import { OrderStatus } from '@prisma/client';
export async function createOrderController(req, res, next) {
    try {
        const userId = req.user.userId;
        const order = await createOrderFromCart({ userId });
        res.status(201).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'CART_EMPTY') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'CART_EMPTY',
                        message: 'Cannot create order from empty cart',
                    },
                });
                return;
            }
            if (error.message.startsWith('{')) {
                try {
                    const errorData = JSON.parse(error.message);
                    if (errorData.code === 'VALIDATION_ERRORS') {
                        res.status(400).json({
                            success: false,
                            error: {
                                code: 'VALIDATION_ERRORS',
                                message: 'Some items in your cart are not available',
                                details: errorData.errors,
                            },
                        });
                        return;
                    }
                }
                catch {
                }
            }
        }
        next(error);
    }
}
export async function getUserOrdersController(req, res, next) {
    try {
        const userId = req.user.userId;
        const orders = await getOrdersByUser(userId);
        res.status(200).json({
            success: true,
            data: orders,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getUserOrderController(req, res, next) {
    try {
        const userId = req.user.userId;
        const orderIdParam = req.params.id;
        if (!orderIdParam || typeof orderIdParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid order ID parameter',
                },
            });
            return;
        }
        const orderId = parseInt(orderIdParam, 10);
        if (isNaN(orderId)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid order ID',
                },
            });
            return;
        }
        const order = await getOrderById(orderId, userId);
        if (!order) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'ORDER_NOT_FOUND',
                    message: 'Order not found',
                },
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getAllOrdersController(_req, res, next) {
    try {
        const orders = await getAllOrders();
        res.status(200).json({
            success: true,
            data: orders,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getOrderByIdController(req, res, next) {
    try {
        const orderIdParam = req.params.id;
        if (!orderIdParam || typeof orderIdParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid order ID parameter',
                },
            });
            return;
        }
        const orderId = parseInt(orderIdParam, 10);
        if (isNaN(orderId)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid order ID',
                },
            });
            return;
        }
        const order = await getOrderById(orderId);
        if (!order) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'ORDER_NOT_FOUND',
                    message: 'Order not found',
                },
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function updateOrderStatusController(req, res, next) {
    try {
        const orderIdParam = req.params.id;
        if (!orderIdParam || typeof orderIdParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid order ID parameter',
                },
            });
            return;
        }
        const orderId = parseInt(orderIdParam, 10);
        if (isNaN(orderId)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid order ID',
                },
            });
            return;
        }
        const { status } = req.body;
        if (!status || typeof status !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Status is required',
                },
            });
            return;
        }
        const validStatuses = Object.values(OrderStatus);
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
                },
            });
            return;
        }
        const order = await updateOrderStatus(orderId, { status: status });
        res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'ORDER_NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'ORDER_NOT_FOUND',
                        message: 'Order not found',
                    },
                });
                return;
            }
            if (error.message === 'INVALID_STATUS_TRANSITION') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_STATUS_TRANSITION',
                        message: 'Invalid status transition',
                    },
                });
                return;
            }
        }
        next(error);
    }
}
export async function getOrderStatsController(_req, res, next) {
    try {
        const stats = await getOrderStats();
        res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=order.controller.js.map