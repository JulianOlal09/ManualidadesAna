import apiClient from '@/lib/api';
import { ApiResponse, Supply, ProductSupply, SuggestedPriceResult } from '@/types';

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

export const supplyService = {
  async getAll(): Promise<Supply[]> {
    const response = await apiClient.get<ApiResponse<Supply[]>>('/admin/supplies');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch supplies');
  },

  async getById(id: number): Promise<Supply> {
    const response = await apiClient.get<ApiResponse<Supply>>(`/admin/supplies/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch supply');
  },

  async create(data: CreateSupplyInput): Promise<Supply> {
    const response = await apiClient.post<ApiResponse<Supply>>('/admin/supplies', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to create supply');
  },

  async update(id: number, data: UpdateSupplyInput): Promise<Supply> {
    const response = await apiClient.put<ApiResponse<Supply>>(`/admin/supplies/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to update supply');
  },

  async delete(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`/admin/supplies/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete supply');
    }
  },

  async getProductSupplies(productId: number): Promise<ProductSupply[]> {
    const response = await apiClient.get<ApiResponse<ProductSupply[]>>(`/admin/products/${productId}/supplies`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch product supplies');
  },

  async addSupplyToProduct(productId: number, data: CreateProductSupplyInput): Promise<ProductSupply> {
    const response = await apiClient.post<ApiResponse<ProductSupply>>(`/admin/products/${productId}/supplies`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to add supply to product');
  },

  async updateSupplyInProduct(productId: number, supplyId: number, quantity: number): Promise<ProductSupply> {
    const response = await apiClient.put<ApiResponse<ProductSupply>>(`/admin/products/${productId}/supplies/${supplyId}`, { quantity });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to update supply in product');
  },

  async removeSupplyFromProduct(productId: number, supplyId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`/admin/products/${productId}/supplies/${supplyId}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to remove supply from product');
    }
  },

  async getSuggestedPrice(productId: number): Promise<SuggestedPriceResult> {
    const response = await apiClient.get<ApiResponse<SuggestedPriceResult>>(`/products/${productId}/suggested-price`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to calculate suggested price');
  },
};

export default supplyService;