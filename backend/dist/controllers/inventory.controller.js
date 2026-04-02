import { getAllInventory, getVariantInventory, adjustStock, getLowStockAlerts, getInventoryStats, } from '../services/inventory.service.js';
export async function getInventoryController(_req, res, next) {
    try {
        const inventory = await getAllInventory();
        res.status(200).json({
            success: true,
            data: inventory,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getVariantInventoryController(req, res, next) {
    try {
        const variantIdParam = req.params.variantId;
        if (!variantIdParam || typeof variantIdParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid variantId parameter',
                },
            });
            return;
        }
        const variantId = parseInt(variantIdParam, 10);
        if (isNaN(variantId)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid variantId',
                },
            });
            return;
        }
        const variant = await getVariantInventory(variantId);
        if (!variant) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'VARIANT_NOT_FOUND',
                    message: 'Variant not found',
                },
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: variant,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function adjustStockController(req, res, next) {
    try {
        const variantIdParam = req.params.variantId;
        if (!variantIdParam || typeof variantIdParam !== 'string') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid variantId parameter',
                },
            });
            return;
        }
        const variantId = parseInt(variantIdParam, 10);
        if (isNaN(variantId)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid variantId',
                },
            });
            return;
        }
        const { quantity, operation } = req.body;
        if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Quantity is required and must be a positive number',
                },
            });
            return;
        }
        if (!operation || !['add', 'set'].includes(operation)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Operation is required and must be "add" or "set"',
                },
            });
            return;
        }
        const variant = await adjustStock(variantId, { quantity, operation });
        res.status(200).json({
            success: true,
            data: variant,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'VARIANT_NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'VARIANT_NOT_FOUND',
                        message: 'Variant not found',
                    },
                });
                return;
            }
            if (error.message === 'VARIANT_NOT_ACTIVE') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VARIANT_NOT_ACTIVE',
                        message: 'Variant is not active',
                    },
                });
                return;
            }
            if (error.message === 'INVALID_STOCK') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_STOCK',
                        message: 'Stock cannot be negative',
                    },
                });
                return;
            }
        }
        next(error);
    }
}
export async function getLowStockAlertsController(_req, res, next) {
    try {
        const alerts = await getLowStockAlerts();
        res.status(200).json({
            success: true,
            data: alerts,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getInventoryStatsController(_req, res, next) {
    try {
        const stats = await getInventoryStats();
        res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=inventory.controller.js.map