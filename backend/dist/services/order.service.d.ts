import { Order, OrderItem, OrderStatus, Variant, Product } from '@prisma/client';
export type OrderWithRelations = Order & {
    items: (OrderItem & {
        variant: Variant & {
            product: Product;
        };
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
export declare function createOrderFromCart(input: CreateOrderInput): Promise<OrderWithRelations>;
export declare function getOrdersByUser(userId: number): Promise<OrderWithRelations[]>;
export declare function getOrderById(orderId: number, userId?: number): Promise<OrderWithRelations | null>;
export declare function getAllOrders(): Promise<OrderWithRelations[]>;
export declare function updateOrderStatus(orderId: number, input: UpdateOrderStatusInput): Promise<Order>;
export declare function getOrderStats(): Promise<{
    total: number;
    pendientes: number;
    enviados: number;
    entregados: number;
    cancelados: number;
}>;
//# sourceMappingURL=order.service.d.ts.map