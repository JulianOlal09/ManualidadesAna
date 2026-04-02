import { prisma } from '../lib/prisma.js';
import { CartItem, Product } from '@prisma/client';

export type CartItemWithRelations = CartItem & {
  product: Product;
};

export interface AddToCartInput {
  userId: number;
  productId: number;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export async function getCart(userId: number): Promise<CartItemWithRelations[]> {
  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  }) as Promise<CartItemWithRelations[]>;
}

export async function addToCart(input: AddToCartInput): Promise<CartItem> {
  const { userId, productId, quantity } = input;

  if (quantity <= 0) {
    throw new Error('INVALID_QUANTITY');
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
  });

  if (!product) {
    throw new Error('PRODUCT_NOT_FOUND');
  }

  if (product.stock < quantity) {
    throw new Error('INSUFFICIENT_STOCK');
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (product.stock < newQuantity) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  }

  return prisma.cartItem.create({
    data: {
      userId,
      productId,
      quantity,
    },
  });
}

export async function updateCartItem(
  userId: number,
  productId: number,
  input: UpdateCartItemInput
): Promise<CartItem> {
  const { quantity } = input;

  if (quantity <= 0) {
    throw new Error('INVALID_QUANTITY');
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    include: {
      product: true,
    },
  });

  if (!cartItem) {
    throw new Error('CART_ITEM_NOT_FOUND');
  }

  if (!cartItem.product.isActive) {
    throw new Error('PRODUCT_NOT_ACTIVE');
  }

  if (cartItem.product.stock < quantity) {
    throw new Error('INSUFFICIENT_STOCK');
  }

  return prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity },
  });
}

export async function removeFromCart(userId: number, productId: number): Promise<void> {
  const cartItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (!cartItem) {
    throw new Error('CART_ITEM_NOT_FOUND');
  }

  await prisma.cartItem.delete({
    where: { id: cartItem.id },
  });
}

export async function clearCart(userId: number): Promise<void> {
  await prisma.cartItem.deleteMany({
    where: { userId },
  });
}

export async function validateCartStock(userId: number): Promise<{
  valid: boolean;
  errors: Array<{ productId: number; message: string }>;
}> {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true,
    },
  });

  const errors: Array<{ productId: number; message: string }> = [];

  for (const item of cartItems) {
    if (!item.product.isActive) {
      errors.push({
        productId: item.productId,
        message: 'Product is no longer active',
      });
      continue;
    }

    if (item.product.stock < item.quantity) {
      errors.push({
        productId: item.productId,
        message: `Insufficient stock. Available: ${item.product.stock}, Requested: ${item.quantity}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
