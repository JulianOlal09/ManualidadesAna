import axios from 'axios';
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
      window.dispatchEvent(new CustomEvent('cart-updated'));
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to add item to cart');
  },

  async updateItem(productId: number, data: CartUpdateRequest): Promise<CartItem> {
    const response = await apiClient.put<ApiResponse<CartItem>>(`/cart/items/${productId}`, data);
    if (response.data.success && response.data.data) {
      window.dispatchEvent(new CustomEvent('cart-updated'));
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to update cart item');
  },

  async removeItem(productId: number): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(`/cart/items/${productId}`);
      if (response.status === 204 || response.data.success) {
        window.dispatchEvent(new CustomEvent('cart-updated'));
        return;
      }
      throw new Error(response.data.error?.message || 'Failed to remove cart item');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 204) {
        window.dispatchEvent(new CustomEvent('cart-updated'));
        return;
      }
      throw err;
    }
  },

  async clearCart(): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<null>>('/cart');
      if (response.status === 204 || response.data.success) {
        window.dispatchEvent(new CustomEvent('cart-updated'));
        return;
      }
      throw new Error(response.data.error?.message || 'Failed to clear cart');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 204) {
        window.dispatchEvent(new CustomEvent('cart-updated'));
        return;
      }
      throw err;
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