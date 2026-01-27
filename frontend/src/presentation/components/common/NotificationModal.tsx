import { useRef, useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useNotificationManagement } from '../../../application/hooks/useNotificationManagement';
import { usePreferences } from '../../../application/context/PreferencesContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../../appStore/store';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'unread' | 'all';

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const { styles, theme } = usePreferences();
    const { notifications, markAsRead, markAllAsRead, fetchNextPage, hasMore, isLoadingMore } = useNotificationManagement();
    const notificationDropdownRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<TabType>('unread');
    const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);

    const filteredNotifications = activeTab === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        try {
            await markAsRead(notificationId);
        } catch (error) {
            console.error('🚨 Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;

        setIsMarkingAllAsRead(true);
        try {
            await markAllAsRead();
        } catch (error) {
            console.error('🚨 Error marking all notifications as read:', error);
            toast.error('Failed to mark all as read');
        } finally {
            setIsMarkingAllAsRead(false);
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

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                notificationDropdownRef.current &&
                !notificationDropdownRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen, onClose]);

    if (!isAuthenticated) return null;

    if (!isOpen) return null;

    const isDarkMode = theme === 'dark';

    return (
        <div ref={notificationDropdownRef} className={`absolute right-0 mt-3 w-[480px] ${styles.card.background} backdrop-blur-xl rounded-2xl shadow-2xl z-50 border ${styles.border} overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.backgroundSecondary} opacity-20`}></div>
            <div className="relative z-10">
                {/* Header with tabs and actions */}
                <div className={`px-6 py-4 border-b ${styles.borderSecondary}`}>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2.5 rounded-xl ${styles.status.primary} bg-opacity-15`}>
                                <svg className={`w-6 h-6 ${styles.status.primary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className={`font-bold text-xl ${styles.textPrimary}`}>Notifications</h3>
                                <span className={`text-sm ${styles.textSecondary}`}>{notifications.length} total</span>
                            </div>
                        </div>

                        {/* Mark All as Read button */}
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={isMarkingAllAsRead}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${styles.status.primary} bg-opacity-15 hover:bg-opacity-25 ${styles.textPrimary} flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isMarkingAllAsRead ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Marking...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Mark All Read</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className={`flex space-x-2 p-1.5 rounded-xl ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'}`}>
                        <button
                            onClick={() => setActiveTab('unread')}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex-1 ${activeTab === 'unread'
                                ? `${styles.status.primary} text-white shadow-lg`
                                : `${isDarkMode ? 'text-slate-300' : 'text-slate-700'} ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`
                                }`}
                        >
                            Unread {unreadCount > 0 && (
                                <span className={`ml-2 px-2.5 py-1 text-xs rounded-full font-semibold ${activeTab === 'unread'
                                    ? (isDarkMode ? 'bg-white/20 text-white' : 'bg-white text-slate-700')
                                    : (isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700')
                                    }`}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex-1 ${activeTab === 'all'
                                ? `${styles.status.primary} text-white shadow-lg`
                                : `${isDarkMode ? 'text-slate-300' : 'text-slate-700'} ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`
                                }`}
                        >
                            All
                        </button>
                    </div>
                </div>

                {/* Notifications list */}
                <div
                    className="h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
                    ref={scrollRef}
                    onScroll={handleScroll}
                >
                    {filteredNotifications.length === 0 ? (
                        <div className={`px-6 py-12 text-center ${styles.textSecondary}`}>
                            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${styles.status.primary} bg-opacity-10 flex items-center justify-center`}>
                                <svg className={`w-10 h-10 ${styles.status.primary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <p className="font-bold text-lg mb-2">
                                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                            </p>
                            <p className="text-sm">
                                {activeTab === 'unread' ? 'All caught up!' : 'Check back later for updates'}
                            </p>
                        </div>
                    ) : (
                        <div className="py-3">
                            {filteredNotifications.map((notification, index) => (
                                <div
                                    key={notification._id}
                                    className={`px-6 py-4 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'} transition-all duration-200 border-l-4 group ${!notification.isRead
                                        ? `${styles.status.primary} border-opacity-100 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`
                                        : 'border-transparent'
                                        } ${index !== filteredNotifications.length - 1 ? `border-b ${styles.borderSecondary}` : ''}`}
                                >
                                    <div className="flex items-start space-x-4">
                                        {/* Notification Icon */}
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${!notification.isRead
                                            ? `${styles.status.primary} bg-opacity-20`
                                            : `${styles.textSecondary} bg-opacity-10`
                                            } flex items-center justify-center mt-1`}>
                                            <div className={!notification.isRead ? styles.status.primary : styles.textSecondary}>
                                                {getNotificationIcon(notification.type || 'default')}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3">
                                                        <h4 className={`font-bold ${styles.textPrimary} truncate`}>
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.isRead && (
                                                            <div className={`w-3 h-3 rounded-full ${styles.status.primary} flex-shrink-0`} />
                                                        )}
                                                    </div>
                                                    <p className={`text-sm ${styles.textSecondary} mt-2 line-clamp-2 leading-relaxed`}>
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <span className={`text-xs font-medium ${styles.textSecondary}`}>
                                                            {formatRelativeTime(notification.createdAt)}
                                                        </span>

                                                        {/* Mark as Read button */}
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={(e) => handleMarkAsRead(e, notification._id)}
                                                                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-200'} transition-all duration-200 ${styles.status.primary} bg-opacity-10 opacity-0 group-hover:opacity-100`}
                                                                title="Mark as read"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M5 13l4 4L19 7"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
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
                            {!hasMore && filteredNotifications.length > 0 && (
                                <div className="text-center text-xs text-gray-400 py-2">All notifications loaded.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}