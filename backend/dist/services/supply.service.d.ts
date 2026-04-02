import { Supply } from '@prisma/client';
export type SupplyWithRelations = Supply & {
    products?: Array<{
        id: number;
        productId: number;
        supplyId: number;
        quantity: number;
        product?: {
            id: number;
            name: string;
        };
    }>;
};
export interface CreateSupplyInput {
    name: string;
    cost: number;
}
export interface UpdateSupplyInput {
    name?: string;
    cost?: number;
}
export interface CreateProductSupplyInput {
    supplyId: number;
    quantity: number;
}
export interface UpdateProductSupplyInput {
    quantity: number;
}
export declare function getAllSupplies(): Promise<SupplyWithRelations[]>;
export declare function getSupplyById(id: number): Promise<SupplyWithRelations | null>;
export declare function createSupply(input: CreateSupplyInput): Promise<Supply>;
export declare function updateSupply(id: number, input: UpdateSupplyInput): Promise<Supply>;
export declare function deleteSupply(id: number): Promise<void>;
export declare function getSuppliesByProduct(productId: number): Promise<{
    id: number;
    supplyId: number;
    quantity: number;
    supply: Supply;
}[]>;
export declare function addSupplyToProduct(productId: number, input: CreateProductSupplyInput): Promise<{
    id: number;
    productId: number;
    supplyId: number;
    quantity: number;
}>;
export declare function updateSupplyInProduct(productId: number, supplyId: number, input: UpdateProductSupplyInput): Promise<{
    id: number;
    productId: number;
    supplyId: number;
    quantity: number;
}>;
export declare function removeSupplyFromProduct(productId: number, supplyId: number): Promise<void>;
//# sourceMappingURL=supply.service.d.ts.map