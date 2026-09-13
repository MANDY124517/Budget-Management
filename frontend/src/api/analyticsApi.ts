import { apiClient } from './client';
import { AnomalyDetectionResponse, ApiResponse, FinancialHealthScore, ForecastResponse, Insight, SpendingAnalysis } from '../types';

export const analyticsApi = {
  getSpendingAnalysis: async (startDate?: string, endDate?: string): Promise<SpendingAnalysis> => {
    const res = await apiClient.get<ApiResponse<SpendingAnalysis>>('/analytics/spending', {
      params: { startDate, endDate },
    });
    return res.data.data;
  },

  getExpenseForecast: async (): Promise<ForecastResponse> => {
    const res = await apiClient.get<ApiResponse<ForecastResponse>>('/analytics/forecast');
    return res.data.data;
  },

  getAnomalies: async (): Promise<AnomalyDetectionResponse> => {
    const res = await apiClient.get<ApiResponse<AnomalyDetectionResponse>>('/analytics/anomalies');
    return res.data.data;
  },

  getFinancialHealthScore: async (): Promise<FinancialHealthScore> => {
    const res = await apiClient.get<ApiResponse<FinancialHealthScore>>('/analytics/health-score');
    return res.data.data;
  },

  getInsights: async (): Promise<Insight[]> => {
    const res = await apiClient.get<ApiResponse<Insight[]>>('/analytics/insights');
    return res.data.data;
  },
};
