import { apiClient } from './client';
import { ApiResponse, Category, CategoryType } from '../types';

export const categoriesApi = {
  getCategories: async (type?: CategoryType): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories', {
      params: type ? { type } : {},
    });
    return res.data.data;
  },

  createCategory: async (data: {
    name: string;
    categoryType: CategoryType;
    icon?: string;
    color?: string;
  }): Promise<Category> => {
    const res = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return res.data.data;
  },

  updateCategory: async (id: number, data: {
    name: string;
    categoryType: CategoryType;
    icon?: string;
    color?: string;
  }): Promise<Category> => {
    const res = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/categories/${id}`);
  },
};
