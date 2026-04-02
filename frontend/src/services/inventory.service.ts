import apiClient from '@/lib/api';
import { ApiResponse, Product } from '@/types';

export type ProductWithCategory = Product & {
  category?: Product['category'];
};

export interface InventoryStats {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  inStock: number;
}

export interface InventoryAlert {
  product: ProductWithCategory;
  currentStock: number;
  minStock: number;
}

export interface AdjustStockRequest {
  quantity: number;
  operation: 'add' | 'set';
}

export const inventoryService = {
  async getAll(): Promise<ProductWithCategory[]> {
    const response = await apiClient.get<ApiResponse<ProductWithCategory[]>>('/admin/inventory');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch inventory');
  },

  async getStats(): Promise<InventoryStats> {
    const response = await apiClient.get<ApiResponse<InventoryStats>>('/admin/inventory/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch inventory stats');
  },

  async getAlerts(): Promise<InventoryAlert[]> {
    const response = await apiClient.get<ApiResponse<InventoryAlert[]>>('/admin/inventory/alerts');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch alerts');
  },

  async adjustStock(productId: number, data: AdjustStockRequest): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>(`/admin/inventory/${productId}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to adjust stock');
  },
};

export default inventoryService;