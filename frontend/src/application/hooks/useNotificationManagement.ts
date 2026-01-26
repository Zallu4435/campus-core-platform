import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { notificationService } from '../services/notification.service';
import { useSelector } from 'react-redux';
import { RootState } from '../../appStore/store';
import { Filters, Notification } from '../../domain/types/management/notificationmanagement';
import { User } from '../../domain/types/auth/Login';

export const useNotificationManagement = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user) as User | null;
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<Filters>({
    recipientType: 'All',
    status: 'All',
    dateRange: 'All',
  });
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const limit = 10;

  const isAdmin = user?.role === 'admin';

  const { data: notificationsData, isLoading, error, isFetching } = useQuery({
    queryKey: ['notifications', page, filters, limit, isAdmin],
    queryFn: () => {
      return notificationService.getNotifications({
        isAdmin,
        page,
        limit,
        recipientType: filters.recipientType !== 'All' ? filters.recipientType.toLowerCase().replace(/\s+/g, '_') : undefined,
        status: filters.status !== 'All' ? filters.status.toLowerCase() : undefined,
        dateRange: filters.dateRange !== 'All' ? filters.dateRange : undefined,
        search: filters.search ? filters.search : undefined,
      });
    },
    enabled: !!user,
  });

  useEffect(() => {
    setAllNotifications([]);
    setPage(1);
    setHasMore(true);
  }, [filters, user]);

  useEffect(() => {
    if (notificationsData && notificationsData.notifications) {
      const normalized = notificationsData.notifications.map(n => ({
        ...n,
        _id: n._id || n.id || '',
      }));
      setAllNotifications((prev) => {
        const ids = new Set(prev.map((n) => n._id));
        const newOnes = normalized.filter((n) => !ids.has(n._id));
        return page === 1 ? normalized : [...prev, ...newOnes];
      });
      setHasMore(page < (notificationsData.totalPages || 1));
    }
  }, [notificationsData, page]);

  const fetchNextPage = useCallback(async () => {
    if (isFetching || !hasMore) return;
    setPage(prev => prev + 1);
  }, [isFetching, hasMore]);

  const { data: selectedNotification, isLoading: isLoadingNotificationDetails } = useQuery({
    queryKey: ['notificationDetails', selectedNotificationId],
    queryFn: async () => {
      if (!selectedNotificationId) return null;
      const data = await notificationService.getNotificationDetails(selectedNotificationId);
      return {
        ...data,
        _id: data._id || data.id || '',
      };
    },
    enabled: !!selectedNotificationId,
  });

  const { mutateAsync: getNotificationDetails } = useMutation({
    mutationFn: async (id: string) => {
      const data = await notificationService.getNotificationDetails(id);
      return {
        ...data,
        _id: data._id || data.id || '',
      };
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to fetch notification details');
    },
  });

  const { mutateAsync: createNotification } = useMutation({
    mutationFn: (data: Omit<Notification, '_id' | 'createdAt' | 'status'>) => notificationService.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send notification');
    },
  });

  const { mutateAsync: deleteNotification } = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete notification');
    },
  });

  const { mutateAsync: markAsRead } = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id: string) => {
      // Optimistically update the local state
      setAllNotifications(prev =>
        prev.map(notification =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification marked as read');
    },
    onError: (error: Error) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.error(error.message || 'Failed to mark notification as read');
    },
  });

  const { mutateAsync: markAllAsRead } = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      // Optimistically update all unread notifications
      setAllNotifications(prev =>
        prev.map(notification =>
          !notification.isRead
            ? { ...notification, isRead: true }
            : notification
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error: Error) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.error(error.message || 'Failed to mark all notifications as read');
    },
  });

  return {
    notifications: allNotifications,
    pageNotifications: (notificationsData?.notifications || []).map(n => ({
      ...n,
      _id: n._id || n.id || '',
    })),
    totalPages: notificationsData?.totalPages || 0,
    page,
    setPage,
    filters,
    setFilters,
    isLoading: isLoading || isFetching,
    error,
    createNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    getNotificationDetails,
    selectedNotification,
    isLoadingNotificationDetails,
    fetchNextPage,
    hasMore,
    isLoadingMore: isFetching && page > 1,
    setSelectedNotificationId,
  };
};