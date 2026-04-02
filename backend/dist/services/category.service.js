import { prisma } from '../lib/prisma.js';
export async function getAllCategories() {
    return prisma.category.findMany({
        where: { isActive: true },
        include: {
            parent: true,
            children: {
                where: { isActive: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}
export async function getCategoryById(id) {
    return prisma.category.findFirst({
        where: { id, isActive: true },
        include: {
            parent: true,
            children: {
                where: { isActive: true },
            },
        },
    });
}
export async function createCategory(input) {
    const existingCategory = await prisma.category.findFirst({
        where: {
            name: { equals: input.name.toLowerCase() },
            isActive: true,
        },
    });
    if (existingCategory) {
        throw new Error('CATEGORY_ALREADY_EXISTS');
    }
    if (input.parentId) {
        const parentExists = await prisma.category.findFirst({
            where: { id: input.parentId, isActive: true },
        });
        if (!parentExists) {
            throw new Error('PARENT_NOT_FOUND');
        }
    }
    return prisma.category.create({
        data: {
            name: input.name,
            description: input.description,
            parentId: input.parentId,
        },
    });
}
export async function updateCategory(id, input) {
    const exists = await prisma.category.findFirst({
        where: { id, isActive: true },
    });
    if (!exists) {
        throw new Error('NOT_FOUND');
    }
    if (input.name) {
        const duplicateCategory = await prisma.category.findFirst({
            where: {
                name: { equals: input.name.toLowerCase() },
                isActive: true,
                id: { not: id },
            },
        });
        if (duplicateCategory) {
            throw new Error('CATEGORY_ALREADY_EXISTS');
        }
    }
    if (input.parentId) {
        const parentExists = await prisma.category.findFirst({
            where: { id: input.parentId, isActive: true },
        });
        if (!parentExists) {
            throw new Error('PARENT_NOT_FOUND');
        }
    }
    const updateData = {};
    if (input.name !== undefined)
        updateData.name = input.name;
    if (input.description !== undefined)
        updateData.description = input.description;
    if (input.parentId !== undefined)
        updateData.parentId = input.parentId;
    return prisma.category.update({
        where: { id },
        data: updateData,
    });
}
export async function deleteCategory(id) {
    const exists = await prisma.category.findFirst({
        where: { id, isActive: true },
    });
    if (!exists) {
        throw new Error('NOT_FOUND');
    }
    const productsCount = await prisma.product.count({
        where: {
            categoryId: id,
            isActive: true,
        },
    });
    if (productsCount > 0) {
        throw new Error('CATEGORY_HAS_PRODUCTS');
    }
    return prisma.category.update({
        where: { id },
        data: { isActive: false },
    });
}
export async function toggleCategoryActive(id) {
    const exists = await prisma.category.findFirst({
        where: { id },
    });
    if (!exists) {
        throw new Error('NOT_FOUND');
    }
    return prisma.category.update({
        where: { id },
        data: { isActive: !exists.isActive },
    });
}
//# sourceMappingURL=category.service.js.map