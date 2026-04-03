import apiClient from '@/lib/api';
import {
  ApiResponse,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResponse,
  User,
} from '@/types';

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const authService = {
  async login(data: AuthLoginRequest): Promise<AuthResponse> {
    console.log('auth.service login:', data);
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    console.log('auth.service response:', response.data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Invalid email or password');
  },

  async register(data: AuthRegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Registration failed');
  },

  async me(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to get user');
  },

  async updateProfile(data: UpdateProfileInput): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Failed to update profile');
  },

  async deleteAccount(password: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>('/auth/account', { data: { password } } as any);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete account');
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

export default authService;
