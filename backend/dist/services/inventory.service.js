import { prisma } from '../lib/prisma.js';
const LOW_STOCK_THRESHOLD = 5;
export async function getAllInventory() {
    return prisma.product.findMany({
        where: {
            isActive: true,
        },
        include: {
            category: true,
        },
        orderBy: {
            stock: 'asc',
        },
    });
}
export async function getProductInventory(productId) {
    return prisma.product.findFirst({
        where: {
            id: productId,
            isActive: true,
        },
        include: {
            category: true,
        },
    });
}
export async function adjustStock(productId, input) {
    const { quantity, operation } = input;
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw new Error('PRODUCT_NOT_FOUND');
    }
    if (!product.isActive) {
        throw new Error('PRODUCT_NOT_ACTIVE');
    }
    let newStock;
    if (operation === 'add') {
        newStock = product.stock + quantity;
    }
    else {
        newStock = quantity;
    }
    if (newStock < 0) {
        throw new Error('INVALID_STOCK');
    }
    return prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
    });
}
export async function getLowStockAlerts() {
    const products = await prisma.product.findMany({
        where: {
            isActive: true,
            stock: {
                lte: LOW_STOCK_THRESHOLD,
            },
        },
        include: {
            category: true,
        },
        orderBy: {
            stock: 'asc',
        },
    });
    return products.map((product) => ({
        product: product,
        currentStock: product.stock,
        minStock: LOW_STOCK_THRESHOLD,
    }));
}
export async function getOutOfStockCount() {
    return prisma.product.count({
        where: {
            isActive: true,
            stock: {
                lte: 0,
            },
        },
    });
}
export async function getLowStockCount() {
    return prisma.product.count({
        where: {
            isActive: true,
            stock: {
                gt: 0,
                lte: LOW_STOCK_THRESHOLD,
            },
        },
    });
}
export async function getInventoryStats() {
    const [totalProducts, outOfStock, lowStock] = await Promise.all([
        prisma.product.count({
            where: {
                isActive: true,
            },
        }),
        prisma.product.count({
            where: {
                isActive: true,
                stock: {
                    lte: 0,
                },
            },
        }),
        prisma.product.count({
            where: {
                isActive: true,
                stock: {
                    gt: 0,
                    lte: LOW_STOCK_THRESHOLD,
                },
            },
        }),
    ]);
    return {
        totalProducts,
        outOfStock,
        lowStock,
        inStock: totalProducts - outOfStock - lowStock,
    };
}
//# sourceMappingURL=inventory.service.js.map