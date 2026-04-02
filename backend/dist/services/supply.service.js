import { prisma } from '../lib/prisma.js';
export async function getAllSupplies() {
    return prisma.supply.findMany({
        include: {
            products: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });
}
export async function getSupplyById(id) {
    return prisma.supply.findUnique({
        where: { id },
        include: {
            products: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
}
export async function createSupply(input) {
    if (!input.name || input.name.trim().length === 0) {
        throw new Error('NAME_REQUIRED');
    }
    if (input.cost === undefined || input.cost <= 0) {
        throw new Error('INVALID_COST');
    }
    return prisma.supply.create({
        data: {
            name: input.name.trim(),
            cost: input.cost,
        },
    });
}
export async function updateSupply(id, input) {
    const exists = await prisma.supply.findUnique({
        where: { id },
    });
    if (!exists) {
        throw new Error('NOT_FOUND');
    }
    if (input.name !== undefined) {
        if (input.name.trim().length === 0) {
            throw new Error('NAME_REQUIRED');
        }
    }
    if (input.cost !== undefined && input.cost <= 0) {
        throw new Error('INVALID_COST');
    }
    const updateData = {};
    if (input.name !== undefined)
        updateData.name = input.name.trim();
    if (input.cost !== undefined)
        updateData.cost = input.cost;
    return prisma.supply.update({
        where: { id },
        data: updateData,
    });
}
export async function deleteSupply(id) {
    const exists = await prisma.supply.findUnique({
        where: { id },
    });
    if (!exists) {
        throw new Error('NOT_FOUND');
    }
    await prisma.supply.delete({
        where: { id },
    });
}
export async function getSuppliesByProduct(productId) {
    return prisma.productSupply.findMany({
        where: { productId },
        include: {
            supply: true,
        },
    });
}
export async function addSupplyToProduct(productId, input) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw new Error('PRODUCT_NOT_FOUND');
    }
    const supply = await prisma.supply.findUnique({
        where: { id: input.supplyId },
    });
    if (!supply) {
        throw new Error('SUPPLY_NOT_FOUND');
    }
    if (input.quantity <= 0) {
        throw new Error('INVALID_QUANTITY');
    }
    const existing = await prisma.productSupply.findUnique({
        where: {
            productId_supplyId: {
                productId,
                supplyId: input.supplyId,
            },
        },
    });
    if (existing) {
        throw new Error('SUPPLY_ALREADY_LINKED');
    }
    return prisma.productSupply.create({
        data: {
            productId,
            supplyId: input.supplyId,
            quantity: input.quantity,
        },
    });
}
export async function updateSupplyInProduct(productId, supplyId, input) {
    const existing = await prisma.productSupply.findUnique({
        where: {
            productId_supplyId: {
                productId,
                supplyId,
            },
        },
    });
    if (!existing) {
        throw new Error('NOT_FOUND');
    }
    if (input.quantity <= 0) {
        throw new Error('INVALID_QUANTITY');
    }
    return prisma.productSupply.update({
        where: {
            productId_supplyId: {
                productId,
                supplyId,
            },
        },
        data: {
            quantity: input.quantity,
        },
    });
}
export async function removeSupplyFromProduct(productId, supplyId) {
    const existing = await prisma.productSupply.findUnique({
        where: {
            productId_supplyId: {
                productId,
                supplyId,
            },
        },
    });
    if (!existing) {
        throw new Error('NOT_FOUND');
    }
    await prisma.productSupply.delete({
        where: {
            productId_supplyId: {
                productId,
                supplyId,
            },
        },
    });
}
//# sourceMappingURL=supply.service.js.map