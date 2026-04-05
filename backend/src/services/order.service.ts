import { prisma } from '../lib/prisma.js';
import { Order, OrderItem, OrderStatus, Product } from '@prisma/client';

export type OrderWithRelations = Order & {
  items: (OrderItem & {
    product: Product;
  })[];
  user?: {
    id: number;
    email: string;
    name: string;
  };
};

export interface CreateOrderInput {
  userId: number;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

export async function createOrderFromCart(input: CreateOrderInput): Promise<OrderWithRelations> {
  const { userId } = input;

  return await prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      throw new Error('CART_EMPTY');
    }

    const errors: Array<{ productId: number; message: string }> = [];

    for (const item of cartItems) {
      if (!item.product.isActive) {
        errors.push({
          productId: item.productId,
          message: `Product "${item.product.name}" is no longer active`,
        });
        continue;
      }

      if (item.product.stock < item.quantity) {
        errors.push({
          productId: item.productId,
          message: `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    if (errors.length > 0) {
      throw new Error(JSON.stringify({ code: 'VALIDATION_ERRORS', errors }));
    }

    let totalAmount = 0;
    for (const item of cartItems) {
      const price = Number(item.product.price);
      totalAmount += price * item.quantity;
    }

    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: OrderStatus.PENDIENTE,
      },
    });

    const orderItemsData = cartItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
    }));

    await tx.orderItem.createMany({
      data: orderItemsData,
    });

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: { userId },
    });

    const orderWithRelations = await tx.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!orderWithRelations) {
      throw new Error('ORDER_NOT_FOUND');
    }

    return orderWithRelations as OrderWithRelations;
  });
}

export async function getOrdersByUser(userId: number): Promise<OrderWithRelations[]> {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  }) as Promise<OrderWithRelations[]>;
}

export async function getOrderById(orderId: number, userId?: number): Promise<OrderWithRelations | null> {
  const whereClause: { id: number; userId?: number } = { id: orderId };
  
  if (userId !== undefined) {
    whereClause.userId = userId;
  }

  return prisma.order.findFirst({
    where: whereClause,
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  }) as Promise<OrderWithRelations | null>;
}

export async function getAllOrders(options?: { page?: number; limit?: number }): Promise<{ data: OrderWithRelations[]; total: number; page: number; limit: number; totalPages: number }> {
  const page = options?.page || 1;
  const limit = options?.limit || 25;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count(),
  ]);

  return {
    data: data as OrderWithRelations[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateOrderStatus(
  orderId: number,
  input: UpdateOrderStatusInput
): Promise<Order> {
  const { status } = input;

  return await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      throw new Error('ORDER_NOT_FOUND');
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDIENTE: [OrderStatus.ENVIADO, OrderStatus.CANCELADO],
      ENVIADO: [OrderStatus.ENTREGADO, OrderStatus.CANCELADO],
      ENTREGADO: [],
      CANCELADO: [],
    };

    const allowedStatuses = validTransitions[existingOrder.status];
    
    if (!allowedStatuses.includes(status)) {
      throw new Error('INVALID_STATUS_TRANSITION');
    }

    // Si se está cancelando el pedido, liberar el stock
    if (status === OrderStatus.CANCELADO) {
      for (const item of existingOrder.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status },
    });
  });
}

export async function getOrderStats(): Promise<{
  total: number;
  pendientes: number;
  enviados: number;
  entregados: number;
  cancelados: number;
  totalSales: number;
}> {
  const [total, pendientes, enviados, entregados, cancelados, salesResult] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.PENDIENTE } }),
    prisma.order.count({ where: { status: OrderStatus.ENVIADO } }),
    prisma.order.count({ where: { status: OrderStatus.ENTREGADO } }),
    prisma.order.count({ where: { status: OrderStatus.CANCELADO } }),
    prisma.order.aggregate({
      where: { status: OrderStatus.ENTREGADO },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    total,
    pendientes,
    enviados,
    entregados,
    cancelados,
    totalSales: salesResult._sum.totalAmount?.toNumber() || 0,
  };
}

export interface SalesByMonth {
  month: string;
  year: number;
  sales: number;
  orders: number;
}

export async function getSalesByLast12Months(): Promise<SalesByMonth[]> {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: twelveMonthsAgo,
      },
      status: {
        in: [OrderStatus.PENDIENTE, OrderStatus.ENVIADO, OrderStatus.ENTREGADO],
      },
    },
    select: {
      createdAt: true,
      totalAmount: true,
    },
  });

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const salesByMonth: Record<string, { sales: number; orders: number }> = {};

  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    salesByMonth[key] = { sales: 0, orders: 0 };
  }

  for (const order of orders) {
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (salesByMonth[key]) {
      salesByMonth[key].sales += Number(order.totalAmount);
      salesByMonth[key].orders += 1;
    }
  }

  const result: SalesByMonth[] = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    result.push({
      month: monthNames[date.getMonth()],
      year: date.getFullYear(),
      sales: salesByMonth[key].sales,
      orders: salesByMonth[key].orders,
    });
  }

  return result;
}

export interface UpdateOrderItemsInput {
  items: Array<{ productId: number; quantity: number }>;
}

export async function updateOrderItems(
  orderId: number,
  userId: number,
  input: UpdateOrderItemsInput
): Promise<OrderWithRelations> {
  return await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      throw new Error('ORDER_NOT_FOUND');
    }

    if (existingOrder.userId !== userId) {
      throw new Error('ORDER_NOT_FOUND');
    }

    if (existingOrder.status !== OrderStatus.PENDIENTE) {
      throw new Error('ONLY_PENDING_ORDERS_CAN_BE_MODIFIED');
    }

    const errors: Array<{ productId: number; message: string }> = [];
    
    for (const item of input.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        errors.push({ productId: item.productId, message: 'Product not available' });
        continue;
      }

      const existingItem = existingOrder.items.find(i => i.productId === item.productId);
      const currentQuantity = existingItem?.quantity || 0;
      const quantityDiff = item.quantity - currentQuantity;

      if (quantityDiff > 0 && product.stock < quantityDiff) {
        errors.push({ 
          productId: item.productId, 
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}` 
        });
      }
    }

    if (errors.length > 0) {
      throw new Error(JSON.stringify({ code: 'VALIDATION_ERRORS', errors }));
    }

    for (const existingItem of existingOrder.items) {
      const newItem = input.items.find(i => i.productId === existingItem.productId);
      
      if (!newItem) {
        const qty: number = existingItem.quantity ?? 0;
        await tx.orderItem.delete({ where: { id: existingItem.id } });
        await tx.product.update({
          where: { id: existingItem.productId },
          data: { stock: { increment: qty } },
        } as any);
      } else if (newItem.quantity !== existingItem.quantity) {
        const oldQty: number = existingItem.quantity ?? 0;
        const newQty: number = newItem.quantity ?? 0;
        const quantityDiff = newQty - oldQty;
        await tx.orderItem.update({
          where: { id: existingItem.id },
          data: { quantity: newItem.quantity },
        });
        await tx.product.update({
          where: { id: existingItem.productId },
          data: { stock: { decrement: quantityDiff } },
        } as any);
      }
    }

    for (const item of input.items) {
      const existingItem = existingOrder.items.find(i => i.productId === item.productId);
      if (!existingItem) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product) {
          await tx.orderItem.create({
            data: {
              orderId,
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: product.price,
            },
          });
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    }

    const updatedOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, email: true, name: true } },
      },
    });

    if (!updatedOrder) {
      throw new Error('ORDER_NOT_FOUND');
    }

    let totalAmount = 0;
    for (const item of updatedOrder.items) {
      totalAmount += Number(item.priceAtPurchase || 0) * item.quantity;
    }

    await tx.order.update({
      where: { id: orderId },
      data: { totalAmount },
    });

    return updatedOrder as OrderWithRelations;
  });
}

export async function cancelOrder(orderId: number, userId: number): Promise<Order> {
  return await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      throw new Error('ORDER_NOT_FOUND');
    }

    if (existingOrder.userId !== userId) {
      throw new Error('ORDER_NOT_FOUND');
    }

    if (existingOrder.status !== OrderStatus.PENDIENTE) {
      throw new Error('ONLY_PENDING_ORDERS_CAN_BE_CANCELLED');
    }

    for (const item of existingOrder.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELADO },
    });
  });
}
