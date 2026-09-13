import { apiClient } from './client';
import { ApiResponse, GoalPriority, GoalStatus, SavingsGoal } from '../types';

export const goalsApi = {
  getGoals: async (): Promise<SavingsGoal[]> => {
    const res = await apiClient.get<ApiResponse<SavingsGoal[]>>('/goals');
    return res.data.data;
  },

  getGoalById: async (id: number): Promise<SavingsGoal> => {
    const res = await apiClient.get<ApiResponse<SavingsGoal>>(`/goals/${id}`);
    return res.data.data;
  },

  createGoal: async (data: {
    name: string;
    targetAccountId?: number;
    targetAmount: number;
    currentAmount?: number;
    targetDate: string;
    priority?: GoalPriority;
    description?: string;
  }): Promise<SavingsGoal> => {
    const res = await apiClient.post<ApiResponse<SavingsGoal>>('/goals', data);
    return res.data.data;
  },

  updateGoal: async (id: number, data: {
    name: string;
    targetAccountId?: number;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    priority: GoalPriority;
    status: GoalStatus;
    description?: string;
  }): Promise<SavingsGoal> => {
    const res = await apiClient.put<ApiResponse<SavingsGoal>>(`/goals/${id}`, data);
    return res.data.data;
  },

  contributeGoal: async (id: number, data: { amount: number; sourceAccountId?: number }): Promise<SavingsGoal> => {
    const res = await apiClient.post<ApiResponse<SavingsGoal>>(`/goals/${id}/contribute`, data);
    return res.data.data;
  },

  deleteGoal: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/goals/${id}`);
  },
};
