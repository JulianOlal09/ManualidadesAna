import { prisma } from '../lib/prisma.js';
const LOW_STOCK_THRESHOLD = 5;
export async function getAllInventory() {
    return prisma.variant.findMany({
        where: {
            isActive: true,
            product: {
                isActive: true,
            },
        },
        include: {
            product: {
                include: {
                    category: true,
                },
            },
        },
        orderBy: {
            stock: 'asc',
        },
    });
}
export async function getVariantInventory(variantId) {
    return prisma.variant.findFirst({
        where: {
            id: variantId,
            isActive: true,
        },
        include: {
            product: {
                include: {
                    category: true,
                },
            },
        },
    });
}
export async function adjustStock(variantId, input) {
    const { quantity, operation } = input;
    const variant = await prisma.variant.findUnique({
        where: { id: variantId },
    });
    if (!variant) {
        throw new Error('VARIANT_NOT_FOUND');
    }
    if (!variant.isActive) {
        throw new Error('VARIANT_NOT_ACTIVE');
    }
    let newStock;
    if (operation === 'add') {
        newStock = variant.stock + quantity;
    }
    else {
        newStock = quantity;
    }
    if (newStock < 0) {
        throw new Error('INVALID_STOCK');
    }
    return prisma.variant.update({
        where: { id: variantId },
        data: { stock: newStock },
    });
}
export async function getLowStockAlerts() {
    const variants = await prisma.variant.findMany({
        where: {
            isActive: true,
            product: {
                isActive: true,
            },
            stock: {
                lte: LOW_STOCK_THRESHOLD,
            },
        },
        include: {
            product: {
                include: {
                    category: true,
                },
            },
        },
        orderBy: {
            stock: 'asc',
        },
    });
    return variants.map((variant) => ({
        variant: variant,
        currentStock: variant.stock,
        minStock: LOW_STOCK_THRESHOLD,
    }));
}
export async function getOutOfStockCount() {
    return prisma.variant.count({
        where: {
            isActive: true,
            product: {
                isActive: true,
            },
            stock: {
                lte: 0,
            },
        },
    });
}
export async function getLowStockCount() {
    return prisma.variant.count({
        where: {
            isActive: true,
            product: {
                isActive: true,
            },
            stock: {
                gt: 0,
                lte: LOW_STOCK_THRESHOLD,
            },
        },
    });
}
export async function getInventoryStats() {
    const [totalVariants, outOfStock, lowStock] = await Promise.all([
        prisma.variant.count({
            where: {
                isActive: true,
                product: {
                    isActive: true,
                },
            },
        }),
        prisma.variant.count({
            where: {
                isActive: true,
                product: {
                    isActive: true,
                },
                stock: {
                    lte: 0,
                },
            },
        }),
        prisma.variant.count({
            where: {
                isActive: true,
                product: {
                    isActive: true,
                },
                stock: {
                    gt: 0,
                    lte: LOW_STOCK_THRESHOLD,
                },
            },
        }),
    ]);
    return {
        totalVariants,
        outOfStock,
        lowStock,
        inStock: totalVariants - outOfStock - lowStock,
    };
}
//# sourceMappingURL=inventory.service.js.map