import apiClient from '@/lib/api';
import {
  ApiResponse,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResponse,
  User,
} from '@/types';

export const authService = {
  async login(data: AuthLoginRequest): Promise<AuthResponse> {
    console.log('auth.service login:', data);
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    console.log('auth.service response:', response.data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Login failed');
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

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

export default authService;
