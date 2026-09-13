import { apiClient } from './client';
import { ApiResponse, PaymentMethod, RecurrenceFrequency, RecurringTransaction, TransactionType } from '../types';

export const recurringApi = {
  getRecurring: async (): Promise<RecurringTransaction[]> => {
    const res = await apiClient.get<ApiResponse<RecurringTransaction[]>>('/recurring');
    return res.data.data;
  },

  getById: async (id: number): Promise<RecurringTransaction> => {
    const res = await apiClient.get<ApiResponse<RecurringTransaction>>(`/recurring/${id}`);
    return res.data.data;
  },

  createRecurring: async (data: {
    accountId: number;
    categoryId: number;
    transactionType: TransactionType;
    amount: number;
    frequency: RecurrenceFrequency;
    intervalCount?: number;
    startDate: string;
    endDate?: string;
    description: string;
    paymentMethod?: PaymentMethod;
  }): Promise<RecurringTransaction> => {
    const res = await apiClient.post<ApiResponse<RecurringTransaction>>('/recurring', data);
    return res.data.data;
  },

  updateRecurring: async (id: number, data: {
    accountId: number;
    categoryId: number;
    transactionType: TransactionType;
    amount: number;
    frequency: RecurrenceFrequency;
    intervalCount?: number;
    startDate: string;
    nextExecutionDate?: string;
    endDate?: string;
    description: string;
    paymentMethod?: PaymentMethod;
    isActive?: boolean;
  }): Promise<RecurringTransaction> => {
    const res = await apiClient.put<ApiResponse<RecurringTransaction>>(`/recurring/${id}`, data);
    return res.data.data;
  },

  triggerNow: async (id: number): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/recurring/${id}/trigger`);
  },

  deleteRecurring: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/recurring/${id}`);
  },
};
