import apiClient from '@/lib/api';
import { ApiResponse, Product, Category } from '@/types';

export const productService = {
  async getAll(categoryId?: number): Promise<Product[]> {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const response = await apiClient.get<ApiResponse<Product[]>>(`/products${params}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch products');
  },

  async getById(id: number): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch product');
  },
};

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch categories');
  },
};

export default productService;
