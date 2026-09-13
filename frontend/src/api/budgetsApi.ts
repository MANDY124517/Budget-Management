import { apiClient } from './client';
import { ApiResponse, Budget, BudgetPeriod, BudgetUtilization } from '../types';

export const budgetsApi = {
  getBudgets: async (): Promise<Budget[]> => {
    const res = await apiClient.get<ApiResponse<Budget[]>>('/budgets');
    return res.data.data;
  },

  getCurrentBudget: async (): Promise<BudgetUtilization | null> => {
    const res = await apiClient.get<ApiResponse<BudgetUtilization | null>>('/budgets/current');
    return res.data.data;
  },

  getBudgetById: async (id: number): Promise<Budget> => {
    const res = await apiClient.get<ApiResponse<Budget>>(`/budgets/${id}`);
    return res.data.data;
  },

  getBudgetUtilization: async (id: number): Promise<BudgetUtilization> => {
    const res = await apiClient.get<ApiResponse<BudgetUtilization>>(`/budgets/${id}/utilization`);
    return res.data.data;
  },

  createBudget: async (data: {
    name: string;
    period: BudgetPeriod;
    startDate: string;
    endDate: string;
    totalBudgetAmount: number;
    alertThresholdPercentage?: number;
    categoryAllocations?: { categoryId: number; allocatedAmount: number }[];
  }): Promise<Budget> => {
    const res = await apiClient.post<ApiResponse<Budget>>('/budgets', data);
    return res.data.data;
  },

  updateBudget: async (id: number, data: {
    name: string;
    period: BudgetPeriod;
    startDate: string;
    endDate: string;
    totalBudgetAmount: number;
    alertThresholdPercentage?: number;
    isActive?: boolean;
    categoryAllocations?: { categoryId: number; allocatedAmount: number }[];
  }): Promise<Budget> => {
    const res = await apiClient.put<ApiResponse<Budget>>(`/budgets/${id}`, data);
    return res.data.data;
  },

  deleteBudget: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/budgets/${id}`);
  },
};
