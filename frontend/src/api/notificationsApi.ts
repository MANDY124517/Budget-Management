import { apiClient } from './client';
import { ApiResponse, NotificationItem, PagedResponse } from '../types';

export const notificationsApi = {
  getNotifications: async (page = 0, size = 20): Promise<PagedResponse<NotificationItem>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<NotificationItem>>>('/notifications', {
      params: { page, size },
    });
    return res.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
    return res.data.data.unreadCount;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put<ApiResponse<void>>(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put<ApiResponse<void>>('/notifications/read-all');
  },
};
