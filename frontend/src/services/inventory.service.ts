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

export interface InventoryFilters {
  search?: string;
  categoryId?: number;
  stockStatus?: 'all' | 'out' | 'low' | 'in';
}

export interface PaginatedInventory {
  data: ProductWithCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const inventoryService = {
  async getAll(
    filters?: InventoryFilters,
    page: number = 1,
    limit: number = 25
  ): Promise<PaginatedInventory> {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    if (filters?.search) params.set('search', filters.search);
    if (filters?.categoryId) params.set('categoryId', filters.categoryId.toString());
    if (filters?.stockStatus) params.set('stockStatus', filters.stockStatus);

    const response = await apiClient.get<ApiResponse<PaginatedInventory>>(`/admin/inventory?${params.toString()}`);
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