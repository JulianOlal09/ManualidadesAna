import apiClient from '@/lib/api';
import { ApiResponse, Product, Category } from '@/types';

export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId?: number;
  imageUrl?: string;
  price?: number;
  sku?: string;
  stock?: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  categoryId?: number;
  imageUrl?: string;
  price?: number;
  sku?: string;
  stock?: number;
  isActive?: boolean;
  deleteImage?: boolean;
}

export interface ProductWithDetails extends Product {
  category?: Category | null;
}

export interface CategoryWithChildren extends Category {
  parent?: Category | null;
  children?: CategoryWithChildren[];
}

export const adminProductService = {
  async getAll(): Promise<ProductWithDetails[]> {
    const response = await apiClient.get<ApiResponse<{ data: ProductWithDetails[]; total: number; page: number; limit: number; totalPages: number }>>('/products?includeInactive=true');
    if (response.data.success && response.data.data) {
      return response.data.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch products');
  },

  async getById(id: number): Promise<ProductWithDetails> {
    const response = await apiClient.get<ApiResponse<ProductWithDetails>>(`/products/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch product');
  },

  async create(data: CreateProductInput, imageFile?: File): Promise<Product> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.categoryId) formData.append('categoryId', data.categoryId.toString());
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.sku) formData.append('sku', data.sku);
    if (data.stock !== undefined) formData.append('stock', data.stock.toString());
    if (imageFile) formData.append('image', imageFile);

    const response = await apiClient.post<ApiResponse<Product>>('/products', formData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to create product');
  },

  async update(id: number, data: UpdateProductInput, imageFile?: File): Promise<Product> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.categoryId !== undefined) formData.append('categoryId', data.categoryId.toString());
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.sku !== undefined) formData.append('sku', data.sku || '');
    if (data.stock !== undefined) formData.append('stock', data.stock.toString());
    if (data.deleteImage) formData.append('deleteImage', 'true');
    if (imageFile) formData.append('image', imageFile);

    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, formData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to update product');
  },

  async delete(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`/products/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete product');
    }
  },

  async toggleActive(id: number): Promise<Product> {
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/toggle-active`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to toggle product active status');
  },
};

export const adminCategoryService = {
  async getAll(): Promise<CategoryWithChildren[]> {
    const response = await apiClient.get<ApiResponse<CategoryWithChildren[]>>('/categories');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch categories');
  },

  async create(data: { name: string; description?: string; parentId?: number }): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to create category');
  },

  async update(id: number, data: { name?: string; description?: string }): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to update category');
  },

  async delete(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete category');
    }
  },

  async toggleActive(id: number): Promise<Category> {
    const response = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}/toggle-active`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to toggle category active status');
  },
};

export default adminProductService;