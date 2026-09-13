import { apiClient } from './client';
import { ApiResponse, DashboardOverview } from '../types';

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverview> => {
    const res = await apiClient.get<ApiResponse<DashboardOverview>>('/dashboard/overview');
    return res.data.data;
  },
};
