import { apiClient } from './client';
import { ApiResponse, AuthResponse, User } from '../types';

export const authApi = {
  register: async (data: { fullName: string; email: string; password: string; defaultCurrency?: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  updateProfile: async (data: { fullName: string; defaultCurrency: string }): Promise<User> => {
    const res = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    return res.data.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.put<ApiResponse<void>>('/auth/change-password', data);
  },
};
