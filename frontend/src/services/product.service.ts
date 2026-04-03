import apiClient from '@/lib/api';
import { ApiResponse, Product, Category } from '@/types';

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productService = {
  async getAll(categoryId?: number, page: number = 1, limit: number = 25): Promise<PaginatedProducts> {
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId.toString());
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    const response = await apiClient.get<ApiResponse<PaginatedProducts>>(`/products?${params.toString()}`);
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

  async getFeatured(limit: number = 10): Promise<Product[]> {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    params.set('page', '1');
    
    const response = await apiClient.get<ApiResponse<PaginatedProducts>>(`/products?${params.toString()}`);
    if (response.data.success && response.data.data) {
      return response.data.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch featured products');
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
