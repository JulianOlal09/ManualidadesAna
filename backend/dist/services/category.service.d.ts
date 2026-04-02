import { Category } from '@prisma/client';
export interface CreateCategoryInput {
    name: string;
    description?: string;
    parentId?: number;
}
export interface UpdateCategoryInput {
    name?: string;
    description?: string;
    parentId?: number;
}
export declare function getAllCategories(): Promise<Category[]>;
export declare function getCategoryById(id: number): Promise<Category | null>;
export declare function createCategory(input: CreateCategoryInput): Promise<Category>;
export declare function updateCategory(id: number, input: UpdateCategoryInput): Promise<Category>;
export declare function deleteCategory(id: number): Promise<Category>;
export declare function toggleCategoryActive(id: number): Promise<Category>;
//# sourceMappingURL=category.service.d.ts.map