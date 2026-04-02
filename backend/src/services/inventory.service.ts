import { prisma } from '../lib/prisma.js';
import { Product, Category } from '@prisma/client';

export type ProductWithCategory = Product & {
  category?: Category | null;
};

export interface AdjustStockInput {
  quantity: number;
  operation: 'add' | 'set';
}

export interface InventoryAlert {
  product: ProductWithCategory;
  currentStock: number;
  minStock: number;
}

const LOW_STOCK_THRESHOLD = 5;

export async function getAllInventory(): Promise<ProductWithCategory[]> {
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
  }) as Promise<ProductWithCategory[]>;
}

export async function getProductInventory(productId: number): Promise<ProductWithCategory | null> {
  return prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
    include: {
      category: true,
    },
  }) as Promise<ProductWithCategory | null>;
}

export async function adjustStock(productId: number, input: AdjustStockInput): Promise<Product> {
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

  let newStock: number;

  if (operation === 'add') {
    newStock = product.stock + quantity;
  } else {
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

export async function getLowStockAlerts(): Promise<InventoryAlert[]> {
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
    product: product as ProductWithCategory,
    currentStock: product.stock,
    minStock: LOW_STOCK_THRESHOLD,
  }));
}

export async function getOutOfStockCount(): Promise<number> {
  return prisma.product.count({
    where: {
      isActive: true,
      stock: {
        lte: 0,
      },
    },
  });
}

export async function getLowStockCount(): Promise<number> {
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

export async function getInventoryStats(): Promise<{
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  inStock: number;
}> {
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
