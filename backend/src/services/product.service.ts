import { prisma } from '../lib/prisma.js';
import { Product, Category } from '@prisma/client';
import { getSignedImageUrl } from './storage.service.js';

export type ProductWithRelations = Product & {
  category?: Category | null;
};

/**
 * Transform product imageUrl (S3 key) to signed URL
 */
async function transformProductImage<T extends Product>(product: T): Promise<T> {
  if (product.imageUrl) {
    const signedUrl = await getSignedImageUrl(product.imageUrl);
    return { ...product, imageUrl: signedUrl };
  }
  return product;
}

/**
 * Transform array of products with signed URLs
 */
async function transformProductImages<T extends Product>(products: T[]): Promise<T[]> {
  return Promise.all(products.map(transformProductImage));
}

export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId?: number;
  imageUrl?: string;
  price: number;
  sku?: string;
  stock?: number;
  marginPercentage?: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string | null;
  categoryId?: number | null;
  imageUrl?: string | null;
  price?: number;
  sku?: string | null;
  stock?: number;
  marginPercentage?: number | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getAllProducts(
  categoryId?: number, 
  pagination?: PaginationParams,
  includeInactive?: boolean
): Promise<PaginatedResult<ProductWithRelations>> {
  const { page = 1, limit = 25 } = pagination || {};
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  
  if (!includeInactive) {
    whereClause.isActive = true;
  }
  
  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({
      where: whereClause,
    }),
  ]);

  // Transform imageUrl keys to signed URLs
  const productsWithSignedUrls = await transformProductImages(products);

  return {
    data: productsWithSignedUrls as ProductWithRelations[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductById(id: number): Promise<ProductWithRelations | null> {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    include: {
      category: true,
    },
  }) as ProductWithRelations | null;

  if (!product) return null;

  // Transform imageUrl key to signed URL
  return transformProductImage(product);
}

function generateSKU(name: string): string {
  const words = name.trim().split(/\s+/);
  let acronym = '';
  for (let i = 0; i < Math.min(words.length, 3); i++) {
    acronym += words[i].charAt(0).toUpperCase();
  }
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${acronym}-${random}`;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
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

  const sku = input.sku || generateSKU(input.name);

  const product = await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
      imageUrl: input.imageUrl,
      price: input.price || 0,
      sku,
      stock: input.stock || 0,
    },
  });

  // Transform imageUrl key to signed URL before returning
  return transformProductImage(product);
}

export async function updateProduct(id: number, input: UpdateProductInput): Promise<Product> {
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

  const updateData: {
    name?: string;
    description?: string | null;
    categoryId?: number | null;
    imageUrl?: string | null;
    price?: number;
    sku?: string | null;
    stock?: number;
    marginPercentage?: number | null;
  } = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
  if (input.price !== undefined) updateData.price = input.price;
  if (input.sku !== undefined) updateData.sku = input.sku;
  if (input.stock !== undefined) updateData.stock = input.stock;
  if (input.marginPercentage !== undefined) updateData.marginPercentage = input.marginPercentage;

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  // Transform imageUrl key to signed URL before returning
  return transformProductImage(product);
}

export async function deleteProduct(id: number): Promise<Product> {
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

export async function toggleProductActive(id: number): Promise<Product> {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new Error('NOT_FOUND');
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  });

  // Transform imageUrl key to signed URL before returning
  return transformProductImage(updatedProduct);
}

export async function adjustStock(productId: number, adjustment: number): Promise<Product> {
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

export interface SuggestedPriceResult {
  totalCost: number;
  marginPercentage: number | null;
  suggestedPrice: number;
  supplies: Array<{
    supplyId: number;
    supplyName: string;
    quantity: number;
    cost: number;
    totalCost: number;
  }>;
}

export async function calculateSuggestedPrice(productId: number): Promise<SuggestedPriceResult> {
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
