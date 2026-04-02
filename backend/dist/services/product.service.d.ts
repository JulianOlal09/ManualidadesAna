import { Product, Category } from '@prisma/client';
export type ProductWithRelations = Product & {
    category?: Category | null;
};
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
    description?: string;
    categoryId?: number;
    imageUrl?: string;
    price?: number;
    sku?: string;
    stock?: number;
    marginPercentage?: number;
}
export declare function getAllProducts(categoryId?: number): Promise<ProductWithRelations[]>;
export declare function getProductById(id: number): Promise<ProductWithRelations | null>;
export declare function createProduct(input: CreateProductInput): Promise<Product>;
export declare function updateProduct(id: number, input: UpdateProductInput): Promise<Product>;
export declare function deleteProduct(id: number): Promise<Product>;
export declare function toggleProductActive(id: number): Promise<Product>;
export declare function adjustStock(productId: number, adjustment: number): Promise<Product>;
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
export declare function calculateSuggestedPrice(productId: number): Promise<SuggestedPriceResult>;
//# sourceMappingURL=product.service.d.ts.map