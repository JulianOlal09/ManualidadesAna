import { CartItem, Variant, Product } from '@prisma/client';
export type CartItemWithRelations = CartItem & {
    variant: Variant & {
        product: Product;
    };
};
export interface AddToCartInput {
    userId: number;
    variantId: number;
    quantity: number;
}
export interface UpdateCartItemInput {
    quantity: number;
}
export declare function getCart(userId: number): Promise<CartItemWithRelations[]>;
export declare function addToCart(input: AddToCartInput): Promise<CartItem>;
export declare function updateCartItem(userId: number, variantId: number, input: UpdateCartItemInput): Promise<CartItem>;
export declare function removeFromCart(userId: number, variantId: number): Promise<void>;
export declare function clearCart(userId: number): Promise<void>;
export declare function validateCartStock(userId: number): Promise<{
    valid: boolean;
    errors: Array<{
        variantId: number;
        message: string;
    }>;
}>;
//# sourceMappingURL=cart.service.d.ts.map