import { apiClient } from './client';
import { ApiResponse, CategorySpending, PagedResponse, PaymentMethod, Transaction, TransactionFilter, TransactionType } from '../types';

export const transactionsApi = {
  getTransactions: async (filter?: TransactionFilter): Promise<PagedResponse<Transaction>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Transaction>>>('/transactions', {
      params: filter,
    });
    return res.data.data;
  },

  getTransactionById: async (id: number): Promise<Transaction> => {
    const res = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return res.data.data;
  },

  createTransaction: async (data: {
    accountId: number;
    categoryId: number;
    transferTargetAccountId?: number;
    transactionType: TransactionType;
    amount: number;
    transactionDate: string;
    description: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
  }): Promise<Transaction> => {
    const res = await apiClient.post<ApiResponse<Transaction>>('/transactions', data);
    return res.data.data;
  },

  updateTransaction: async (id: number, data: {
    accountId: number;
    categoryId: number;
    transferTargetAccountId?: number;
    transactionType: TransactionType;
    amount: number;
    transactionDate: string;
    description: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
  }): Promise<Transaction> => {
    const res = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
    return res.data.data;
  },

  deleteTransaction: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/transactions/${id}`);
  },

  getCategorySummary: async (startDate?: string, endDate?: string): Promise<CategorySpending[]> => {
    const res = await apiClient.get<ApiResponse<CategorySpending[]>>('/transactions/category-summary', {
      params: { startDate, endDate },
    });
    return res.data.data;
  },

  exportCsvUrl: (startDate?: string, endDate?: string): string => {
    const baseUrl = apiClient.defaults.baseURL || 'http://localhost:8080/api';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return `${baseUrl}/transactions/export/csv?${params.toString()}`;
  },
};
