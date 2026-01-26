import { Notification, NotificationApiResponse } from '../../domain/types/management/notificationmanagement';
import httpClient from '../../frameworks/api/httpClient';
import { isAxiosErrorWithApiError } from '../../shared/types/apiError';

class NotificationService {
  async getNotifications(filters: {
    isAdmin?: boolean,
    page?: number,
    limit?: number,
    recipientType?: string,
    status?: string,
    dateRange?: string,
    search?: string
  }): Promise<NotificationApiResponse> {
    try {
      const endpoint = '/admin/notifications';
      const response = await httpClient.get<{ data: NotificationApiResponse }>(endpoint, {
        params: filters,
      });
      return response.data.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch notifications');
      }
      throw new Error('Failed to fetch notifications');
    }
  }

  async getNotificationDetails(id: string): Promise<Notification> {
    try {
      const response = await httpClient.get<{ data: { notification: Notification } }>(`/admin/notifications/${id}`);
      return response.data.data.notification;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch notification details');
      }
      throw new Error('Failed to fetch notification details');
    }
  }

  async createNotification(data: Omit<Notification, '_id' | 'createdAt' | 'status'>): Promise<Notification> {
    try {
      const response = await httpClient.post<Notification>('/admin/notifications', data);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to send notification');
      }
      throw new Error('Failed to send notification');
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      await httpClient.delete(`/admin/notifications/${id}`);
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to delete notification');
      }
      throw new Error('Failed to delete notification');
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await httpClient.patch(`/admin/notifications/${id}/read`);
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to mark notification as read');
      }
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await httpClient.patch('/admin/notifications/read-all');
    } catch (error: unknown) {
      if (isAxiosErrorWithApiError(error)) {
        throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to mark all notifications as read');
      }
      throw new Error('Failed to mark all notifications as read');
    }
  }
}

export const notificationService = new NotificationService();