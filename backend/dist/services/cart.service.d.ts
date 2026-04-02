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
export declare function getCart(userId: number): Promise<CartItemWithRelations[]>;
export declare function addToCart(input: AddToCartInput): Promise<CartItem>;
export declare function updateCartItem(userId: number, productId: number, input: UpdateCartItemInput): Promise<CartItem>;
export declare function removeFromCart(userId: number, productId: number): Promise<void>;
export declare function clearCart(userId: number): Promise<void>;
export declare function validateCartStock(userId: number): Promise<{
    valid: boolean;
    errors: Array<{
        productId: number;
        message: string;
    }>;
}>;
//# sourceMappingURL=cart.service.d.ts.map