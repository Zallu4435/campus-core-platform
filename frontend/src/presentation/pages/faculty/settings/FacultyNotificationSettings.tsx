import { useRef, useCallback } from 'react';
import { FaBell, FaCheck } from 'react-icons/fa';
import { useNotificationManagement } from '../../../../application/hooks/useNotificationManagement';

export default function FacultyNotificationSettings() {
  const { notifications, markAsRead, markAllAsRead, fetchNextPage, hasMore, isLoadingMore } = useNotificationManagement();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'assignment':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9z" />
          </svg>
        );
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || isLoadingMore || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      fetchNextPage();
    }
  }, [isLoadingMore, hasMore, fetchNextPage]);

  return (
    <div className="flex-1 p-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-slate-50 p-6 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm">
              <FaBell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Notification Settings</h1>
              <p className="text-slate-600">Manage your notification preferences and view notifications</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <FaBell className="inline" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Recent Notifications</h3>
                  <p className="text-sm text-slate-500">{notifications.length} total notifications</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              <div
                className="space-y-3 max-h-96 overflow-y-auto"
                ref={scrollRef}
                onScroll={handleScroll}
              >
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaBell className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No notifications yet</p>
                    <p className="text-sm text-slate-400">You'll see notifications here when they arrive</p>
                  </div>
                ) : (
                  <>
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 rounded-lg border transition-all duration-200 ${!notification.isRead
                          ? 'bg-purple-50 border-purple-200'
                          : 'bg-slate-50 border-slate-200'
                          }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${!notification.isRead ? 'bg-purple-100' : 'bg-slate-100'
                            } flex items-center justify-center`}>
                            <div className={!notification.isRead ? 'text-purple-600' : 'text-slate-500'}>
                              {getNotificationIcon(notification.type || 'default')}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`font-medium ${!notification.isRead ? 'text-slate-800' : 'text-slate-600'}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-slate-500 mt-1">{notification.message}</p>
                                <p className="text-xs text-slate-400 mt-2">
                                  {formatRelativeTime(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="ml-2 p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <FaCheck className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoadingMore && (
                      <div className="flex justify-center py-2">
                        <svg className="animate-spin h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                    {!hasMore && notifications.length > 0 && (
                      <div className="text-center text-xs text-gray-400 py-2">All notifications loaded.</div>
                    )}
                  </>
                )}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
} 