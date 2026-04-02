import { prisma } from '../lib/prisma.js';
export async function getAllProducts(categoryId) {
    return prisma.product.findMany({
        where: {
            isActive: true,
            ...(categoryId ? { categoryId } : {}),
        },
        include: {
            category: true,
        },
        orderBy: { createdAt: 'desc' },
    });
}
export async function getProductById(id) {
    return prisma.product.findFirst({
        where: { id, isActive: true },
        include: {
            category: true,
        },
    });
}
export async function createProduct(input) {
    if (input.price !== undefined && input.price <= 0) {
        throw new Error('INVALID_PRICE');
    }
    if (input.stock !== undefined && input.stock < 0) {
        throw new Error('INVALID_STOCK');
    }
    if (input.categoryId) {
        const categoryExists = await prisma.category.findFirst({
            where: { id: input.categoryId, isActive: true },
        });
        if (!categoryExists) {
            throw new Error('CATEGORY_NOT_FOUND');
        }
    }
    return prisma.product.create({
        data: {
            name: input.name,
            description: input.description,
            categoryId: input.categoryId,
            imageUrl: input.imageUrl,
            price: input.price || 0,
            sku: input.sku,
            stock: input.stock || 0,
        },
    });
}
export async function updateProduct(id, input) {
    const exists = await prisma.product.findFirst({
        where: { id, isActive: true },
    });
    if (!exists) {
        throw new Error('NOT_FOUND');
    }
    if (input.price !== undefined && input.price <= 0) {
        throw new Error('INVALID_PRICE');
    }
    if (input.stock !== undefined && input.stock < 0) {
        throw new Error('INVALID_STOCK');
    }
    if (input.categoryId) {
        const categoryExists = await prisma.category.findFirst({
            where: { id: input.categoryId, isActive: true },
        });
        if (!categoryExists) {
            throw new Error('CATEGORY_NOT_FOUND');
        }
    }
    const updateData = {};
    if (input.name !== undefined)
        updateData.name = input.name;
    if (input.description !== undefined)
        updateData.description = input.description;
    if (input.categoryId !== undefined)
        updateData.categoryId = input.categoryId;
    if (input.imageUrl !== undefined)
        updateData.imageUrl = input.imageUrl;
    if (input.price !== undefined)
        updateData.price = input.price;
    if (input.sku !== undefined)
        updateData.sku = input.sku;
    if (input.stock !== undefined)
        updateData.stock = input.stock;
    if (input.marginPercentage !== undefined)
        updateData.marginPercentage = input.marginPercentage;
    return prisma.product.update({
        where: { id },
        data: updateData,
    });
}
export async function deleteProduct(id) {
    const exists = await prisma.product.findFirst({
        where: { id, isActive: true },
    });
    if (!exists) {
        throw new Error('NOT_FOUND');
    }
    return prisma.product.update({
        where: { id },
        data: { isActive: false },
    });
}
export async function toggleProductActive(id) {
    const product = await prisma.product.findUnique({
        where: { id },
    });
    if (!product) {
        throw new Error('NOT_FOUND');
    }
    return prisma.product.update({
        where: { id },
        data: { isActive: !product.isActive },
    });
}
export async function adjustStock(productId, adjustment) {
    const product = await prisma.product.findFirst({
        where: { id: productId, isActive: true },
    });
    if (!product) {
        throw new Error('NOT_FOUND');
    }
    const newStock = product.stock + adjustment;
    if (newStock < 0) {
        throw new Error('INVALID_STOCK');
    }
    return prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
    });
}
export async function calculateSuggestedPrice(productId) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw new Error('NOT_FOUND');
    }
    const productSupplies = await prisma.productSupply.findMany({
        where: { productId },
        include: {
            supply: true,
        },
    });
    const supplies = productSupplies.map((ps) => ({
        supplyId: ps.supplyId,
        supplyName: ps.supply.name,
        quantity: Number(ps.quantity),
        cost: Number(ps.supply.cost),
        totalCost: Number(ps.supply.cost) * Number(ps.quantity),
    }));
    const totalCost = supplies.reduce((sum, s) => sum + s.totalCost, 0);
    const marginPercentage = product.marginPercentage ? Number(product.marginPercentage) : null;
    let suggestedPrice = totalCost;
    if (marginPercentage && marginPercentage > 0) {
        suggestedPrice = totalCost + (totalCost * marginPercentage / 100);
    }
    return {
        totalCost,
        marginPercentage,
        suggestedPrice,
        supplies,
    };
}
//# sourceMappingURL=product.service.js.map