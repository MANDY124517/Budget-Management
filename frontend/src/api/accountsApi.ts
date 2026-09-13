import { apiClient } from './client';
import { Account, AccountSummary, AccountType, ApiResponse } from '../types';

export const accountsApi = {
  getAccounts: async (): Promise<Account[]> => {
    const res = await apiClient.get<ApiResponse<Account[]>>('/accounts');
    return res.data.data;
  },

  getSummary: async (): Promise<AccountSummary> => {
    const res = await apiClient.get<ApiResponse<AccountSummary>>('/accounts/summary');
    return res.data.data;
  },

  getAccountById: async (id: number): Promise<Account> => {
    const res = await apiClient.get<ApiResponse<Account>>(`/accounts/${id}`);
    return res.data.data;
  },

  createAccount: async (data: {
    name: string;
    accountType: AccountType;
    initialBalance?: number;
    currency?: string;
    institutionName?: string;
    accountNumberMask?: string;
  }): Promise<Account> => {
    const res = await apiClient.post<ApiResponse<Account>>('/accounts', data);
    return res.data.data;
  },

  updateAccount: async (id: number, data: {
    name: string;
    accountType: AccountType;
    institutionName?: string;
    accountNumberMask?: string;
    isActive?: boolean;
  }): Promise<Account> => {
    const res = await apiClient.put<ApiResponse<Account>>(`/accounts/${id}`, data);
    return res.data.data;
  },

  deleteAccount: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/accounts/${id}`);
  },
};
