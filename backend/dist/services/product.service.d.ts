import { Product, Variant, Category } from '@prisma/client';
export type ProductWithRelations = Product & {
    category?: Category | null;
    variants?: Variant[];
};
export interface CreateProductInput {
    name: string;
    description?: string;
    categoryId?: number;
    imageUrl?: string;
}
export interface UpdateProductInput {
    name?: string;
    description?: string;
    categoryId?: number;
    imageUrl?: string;
}
export interface CreateVariantInput {
    productId: number;
    name: string;
    sku?: string;
    price: number;
    stock: number;
}
export interface UpdateVariantInput {
    name?: string;
    sku?: string;
    price?: number;
    stock?: number;
}
export declare function getAllProducts(): Promise<ProductWithRelations[]>;
export declare function getProductById(id: number): Promise<ProductWithRelations | null>;
export declare function createProduct(input: CreateProductInput): Promise<Product>;
export declare function updateProduct(id: number, input: UpdateProductInput): Promise<Product>;
export declare function deleteProduct(id: number): Promise<Product>;
export declare function getVariantById(id: number): Promise<Variant | null>;
export declare function createVariant(input: CreateVariantInput): Promise<Variant>;
export declare function updateVariant(id: number, input: UpdateVariantInput): Promise<Variant>;
export declare function deleteVariant(id: number): Promise<Variant>;
//# sourceMappingURL=product.service.d.ts.map