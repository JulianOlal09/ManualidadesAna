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
export declare function getAllInventory(): Promise<ProductWithCategory[]>;
export declare function getProductInventory(productId: number): Promise<ProductWithCategory | null>;
export declare function adjustStock(productId: number, input: AdjustStockInput): Promise<Product>;
export declare function getLowStockAlerts(): Promise<InventoryAlert[]>;
export declare function getOutOfStockCount(): Promise<number>;
export declare function getLowStockCount(): Promise<number>;
export declare function getInventoryStats(): Promise<{
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
    inStock: number;
}>;
//# sourceMappingURL=inventory.service.d.ts.map