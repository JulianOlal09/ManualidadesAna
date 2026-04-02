import apiClient from '@/lib/api';
import { ApiResponse, CartItem, CartItemRequest, CartUpdateRequest } from '@/types';

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    const response = await apiClient.get<ApiResponse<CartItem[]>>('/cart');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch cart');
  },

  async addItem(data: CartItemRequest): Promise<CartItem> {
    const response = await apiClient.post<ApiResponse<CartItem>>('/cart/items', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to add item to cart');
  },

  async updateItem(productId: number, data: CartUpdateRequest): Promise<CartItem> {
    const response = await apiClient.put<ApiResponse<CartItem>>(`/cart/items/${productId}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to update cart item');
  },

  async removeItem(productId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`/cart/items/${productId}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to remove cart item');
    }
  },

  async clearCart(): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>('/cart');
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to clear cart');
    }
  },

  async validateCart(): Promise<{ valid: boolean; errors: Array<{ productId: number; message: string }> }> {
    const response = await apiClient.get<ApiResponse<{ valid: boolean; errors: Array<{ productId: number; message: string }> }>>('/cart/validate');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to validate cart');
  },
};

export default cartService;