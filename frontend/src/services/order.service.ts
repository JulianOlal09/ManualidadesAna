import apiClient from '@/lib/api';
import { ApiResponse, Order, OrderStatus, OrderStats } from '@/types';

export const orderService = {
  async createOrder(): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>('/orders');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to create order');
  },

  async getMyOrders(): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch orders');
  },

  async getMyOrderById(id: number): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch order');
  },

  async getAllOrders(): Promise<Order[]> {
    const response = await apiClient.get<ApiResponse<Order[]>>('/admin/orders');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch all orders');
  },

  async getOrderById(id: number): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(`/admin/orders/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch order');
  },

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const response = await apiClient.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to update order status');
  },

  async getStats(): Promise<OrderStats> {
    const response = await apiClient.get<ApiResponse<OrderStats>>('/admin/orders/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch order stats');
  },

  async updateOrderItems(orderId: number, items: Array<{ productId: number; quantity: number }>): Promise<Order> {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${orderId}`, { items });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to update order');
  },

  async cancelOrder(orderId: number): Promise<Order> {
    const response = await apiClient.delete<ApiResponse<Order>>(`/orders/${orderId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to cancel order');
  },
};

export default orderService;
