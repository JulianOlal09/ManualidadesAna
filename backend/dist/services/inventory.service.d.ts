import { Variant, Product } from '@prisma/client';
export type VariantWithProduct = Variant & {
    product: Product;
};
export interface AdjustStockInput {
    quantity: number;
    operation: 'add' | 'set';
    reason?: string;
}
export interface InventoryAlert {
    variant: VariantWithProduct;
    currentStock: number;
    minStock: number;
}
export declare function getAllInventory(): Promise<VariantWithProduct[]>;
export declare function getVariantInventory(variantId: number): Promise<VariantWithProduct | null>;
export declare function adjustStock(variantId: number, input: AdjustStockInput): Promise<Variant>;
export declare function getLowStockAlerts(): Promise<InventoryAlert[]>;
export declare function getOutOfStockCount(): Promise<number>;
export declare function getLowStockCount(): Promise<number>;
export declare function getInventoryStats(): Promise<{
    totalVariants: number;
    outOfStock: number;
    lowStock: number;
    inStock: number;
}>;
//# sourceMappingURL=inventory.service.d.ts.map