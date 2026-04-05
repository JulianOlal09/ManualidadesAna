import { prisma } from '../lib/prisma.js';
import { Supply } from '@prisma/client';

export type SupplyWithRelations = Omit<Supply, 'cost'> & {
  cost: number;
  products?: Array<{
    id: number;
    productId: number;
    supplyId: number;
    quantity: number;
    product?: {
      id: number;
      name: string;
    };
  }>;
};

export interface CreateSupplyInput {
  name: string;
  cost: number;
}

export interface UpdateSupplyInput {
  name?: string;
  cost?: number;
}

export interface CreateProductSupplyInput {
  supplyId: number;
  quantity: number;
}

export interface UpdateProductSupplyInput {
  quantity: number;
}

export async function getAllSupplies(options?: { page?: number; limit?: number; search?: string }): Promise<{ data: SupplyWithRelations[]; total: number; page: number; limit: number; totalPages: number }> {
  const page = options?.page || 1;
  const limit = options?.limit || 25;
  const skip = (page - 1) * limit;
  const search = options?.search || '';

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.supply.findMany({
      where,
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
      skip,
      take: limit,
    }),
    prisma.supply.count({ where }),
  ]);

  return {
    data: data.map(supply => ({
      ...supply,
      cost: supply.cost.toNumber(),
      products: supply.products?.map(ps => ({
        id: ps.id,
        productId: ps.productId,
        supplyId: ps.supplyId,
        quantity: ps.quantity,
        product: ps.product,
      })) || [],
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getSupplyStats(): Promise<{ totalSupplies: number; totalCost: number }> {
  const [totalSupplies, costResult] = await Promise.all([
    prisma.supply.count(),
    prisma.supply.aggregate({
      _sum: { cost: true },
    }),
  ]);

  return {
    totalSupplies,
    totalCost: costResult._sum.cost?.toNumber() || 0,
  };
}

export async function getSupplyById(id: number): Promise<SupplyWithRelations | null> {
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
  }) as Promise<SupplyWithRelations | null>;
}

export async function createSupply(input: CreateSupplyInput): Promise<Supply> {
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

export async function updateSupply(id: number, input: UpdateSupplyInput): Promise<Supply> {
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

  const updateData: {
    name?: string;
    cost?: number;
  } = {};

  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.cost !== undefined) updateData.cost = input.cost;

  return prisma.supply.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteSupply(id: number): Promise<void> {
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

export async function getSuppliesByProduct(productId: number): Promise<{
  id: number;
  supplyId: number;
  quantity: number;
  supply: Omit<Supply, 'cost'> & { cost: number };
}[]> {
  const supplies = await prisma.productSupply.findMany({
    where: { productId },
    include: {
      supply: true,
    },
  });

  return supplies.map(ps => ({
    id: ps.id,
    supplyId: ps.supplyId,
    quantity: ps.quantity.toNumber(),
    supply: {
      ...ps.supply,
      cost: ps.supply.cost.toNumber(),
    },
  }));
}

export async function addSupplyToProduct(
  productId: number,
  input: CreateProductSupplyInput
): Promise<{
  id: number;
  productId: number;
  supplyId: number;
  quantity: number;
}> {
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

  const created = await prisma.productSupply.create({
    data: {
      productId,
      supplyId: input.supplyId,
      quantity: input.quantity,
    },
  });

  return {
    id: created.id,
    productId: created.productId,
    supplyId: created.supplyId,
    quantity: created.quantity.toNumber(),
  };
}

export async function updateSupplyInProduct(
  productId: number,
  supplyId: number,
  input: UpdateProductSupplyInput
): Promise<{
  id: number;
  productId: number;
  supplyId: number;
  quantity: number;
}> {
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

  const updated = await prisma.productSupply.update({
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

  return {
    id: updated.id,
    productId: updated.productId,
    supplyId: updated.supplyId,
    quantity: updated.quantity.toNumber(),
  };
}

export async function removeSupplyFromProduct(
  productId: number,
  supplyId: number
): Promise<void> {
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