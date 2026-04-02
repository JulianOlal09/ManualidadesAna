import { prisma } from '../lib/prisma.js';
export async function getAllProducts() {
    return prisma.product.findMany({
        where: { isActive: true },
        include: {
            category: true,
            variants: {
                where: { isActive: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}
export async function getProductById(id) {
    const product = await prisma.product.findFirst({
        where: { id, isActive: true },
        include: {
            category: true,
            variants: {
                where: { isActive: true },
            },
        },
    });
    return product;
}
export async function createProduct(input) {
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
export async function getVariantById(id) {
    return prisma.variant.findFirst({
        where: { id, isActive: true },
        include: { product: true },
    });
}
export async function createVariant(input) {
    if (input.price <= 0) {
        throw new Error('INVALID_PRICE');
    }
    if (input.stock < 0) {
        throw new Error('INVALID_STOCK');
    }
    const product = await prisma.product.findFirst({
        where: { id: input.productId, isActive: true },
    });
    if (!product) {
        throw new Error('PRODUCT_NOT_FOUND');
    }
    return prisma.variant.create({
        data: {
            productId: input.productId,
            name: input.name,
            sku: input.sku,
            price: input.price,
            stock: input.stock,
        },
    });
}
export async function updateVariant(id, input) {
    const exists = await prisma.variant.findFirst({
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
    const updateData = {};
    if (input.name !== undefined)
        updateData.name = input.name;
    if (input.sku !== undefined)
        updateData.sku = input.sku;
    if (input.price !== undefined)
        updateData.price = input.price;
    if (input.stock !== undefined)
        updateData.stock = input.stock;
    return prisma.variant.update({
        where: { id },
        data: updateData,
    });
}
export async function deleteVariant(id) {
    const exists = await prisma.variant.findFirst({
        where: { id, isActive: true },
    });
    if (!exists) {
        throw new Error('NOT_FOUND');
    }
    return prisma.variant.update({
        where: { id },
        data: { isActive: false },
    });
}
//# sourceMappingURL=product.service.js.map