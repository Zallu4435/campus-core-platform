import React, { useState, useCallback } from 'react';
import {
  IoAdd as Plus,
  IoEyeOutline as Eye,
  IoTrashOutline as Trash2,
  IoPersonOutline as User,
  IoPeopleOutline as Group,
} from 'react-icons/io5';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';
import AddNotificationModal from './AddNotificationModal';
import NotificationDetailsModal from './NotificationDetailsModal';
import { useNotificationManagement } from '../../../../application/hooks/useNotificationManagement';
import WarningModal from '../../../components/common/WarningModal';
import ApplicationsTable from '../../../components/admin/management/ApplicationsTable';
import Pagination from '../../../components/admin/management/Pagination';
import Header from '../../../components/admin/management/Header';
import { Notification } from '../../../../domain/types/management/notificationmanagement';
import { RECIPIENT_TYPES, STATUSES, notificationColumns } from '../../../../shared/constants/notificationManagementConstants';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const NotificationManagement: React.FC = () => {
  const {
    notifications,
    pageNotifications,
    totalPages,
    page,
    setPage,
    filters,
    setFilters,
    isLoading,
    error,
    createNotification,
    deleteNotification,
    getNotificationDetails,
    isLoadingNotificationDetails,
  } = useNotificationManagement();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showAddNotificationModal, setShowAddNotificationModal] = useState(false);
  const [showNotificationDetailsModal, setShowNotificationDetailsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedSearchQuery,
    }));
  }, [debouncedSearchQuery]);

  const handleAddNotification = () => {
    setSelectedNotification(null);
    setShowAddNotificationModal(true);
  };

  const handleViewNotification = async (notification: Notification) => {
    try {
      const details = await getNotificationDetails(notification._id);
      setSelectedNotification(details);
      setShowNotificationDetailsModal(true);
    } catch (error) {
      console.error('Error fetching notification details:', error);
      toast.error('Failed to fetch notification details');
    }
  };

  const handleSaveNotification = async (data: Omit<Notification, '_id' | 'createdAt' | 'status'>) => {
    try {
      await createNotification(data);
      setShowAddNotificationModal(false);
    } catch (error: unknown) {
      let message = 'Failed to send notification';
      if (error && typeof error === 'object') {
        if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
          message = (error.response.data as { message?: string }).message || message;
        } else if ('message' in error && typeof error.message === 'string') {
          message = error.message;
        }
      }
      toast.error(message);
    }
  };

  const handleDeleteNotification = (id: string) => {
    setItemToDelete(id);
    setShowWarningModal(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteNotification(itemToDelete);
        setShowWarningModal(false);
        setItemToDelete(null);
      } catch (error: unknown) {
        let message = 'Failed to delete notification';
        if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
          message = error.message;
        }
        toast.error(message);
      }
    }
  };

  const debouncedFilterChange = useCallback(
    debounce((field: string, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
      setPage(1);
    }, 300),
    []
  );

  const handleResetFilters = () => {
    setFilters({
      recipientType: 'All',
      status: 'All',
      dateRange: 'All',
      search: '',
    });
    setSearchQuery('');
    setPage(1);
  };

  const notificationActions = [
    {
      icon: <Eye size={16} />,
      label: 'View Notification',
      onClick: handleViewNotification,
      color: 'blue' as const,
      disabled: () => isLoadingNotificationDetails,
    },
    {
      icon: <Trash2 size={16} />,
      label: 'Delete Notification',
      onClick: (notification: Notification) => handleDeleteNotification(notification._id),
      color: 'red' as const,
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-500/10 blur-md"
            style={{
              width: `${Math.random() * 12 + 4}px`,
              height: `${Math.random() * 12 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatingMist ${Math.random() * 15 + 20}s ease-in-out infinite ${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Header
          title="Notification Management"
          subtitle="Manage and send notifications to students and faculty"
          stats={[
            {
              icon: <Group />,
              title: 'Total Notifications',
              value: (notifications?.length || 0).toString(),
              change: '+10%',
              isPositive: true,
            },
            {
              icon: <User />,
              title: 'Sent Notifications',
              value: (notifications || []).filter((n) => n.status.toLowerCase() === 'sent').length.toString(),
              change: '+5%',
              isPositive: true,
            },
          ]}
          tabs={[{ label: 'Notifications', icon: <Group size={16} />, active: true }]}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search notifications..."
          filters={filters as any}
          filterOptions={{
            recipientType: RECIPIENT_TYPES,
            status: STATUSES,
            dateRange: ['All', 'Last Week', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'Last Year'],
          }}
          debouncedFilterChange={debouncedFilterChange}
          handleResetFilters={handleResetFilters}
          onTabClick={() => { }}
        />

        <div className="mt-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-purple-500/20 min-h-[300px] relative">
            {/* Loading overlay for table/grid only */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 z-20 rounded-xl">
                <LoadingSpinner />
              </div>
            )}
            <div className={`px-6 py-5 ${isLoading ? 'opacity-50 pointer-events-none select-none' : ''}`}>
              <button
                onClick={handleAddNotification}
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                aria-label="Add new notification"
              >
                <Plus size={16} />
                Add Notification
              </button>

              {pageNotifications.length > 0 && (
                <>
                  <ApplicationsTable data={pageNotifications} columns={notificationColumns} actions={notificationActions} />
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    itemsCount={pageNotifications.length}
                    itemName="notifications"
                    onPageChange={(newPage) => setPage(newPage)}
                    onFirstPage={() => setPage(1)}
                    onLastPage={() => setPage(totalPages)}
                  />
                </>
              )}
              {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                    <Group size={32} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">No Notifications Found</h3>
                  <p className="text-gray-400 text-center max-w-sm">
                    There are no notifications matching your current filters. Try adjusting your search criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddNotificationModal
        isOpen={showAddNotificationModal}
        onClose={() => setShowAddNotificationModal(false)}
        onSubmit={handleSaveNotification}
        recipientTypes={RECIPIENT_TYPES.filter((type) => type !== 'All')}
      />

      <NotificationDetailsModal
        isOpen={showNotificationDetailsModal}
        onClose={() => {
          setShowNotificationDetailsModal(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
      />

      <WarningModal
        isOpen={showWarningModal}
        onClose={() => {
          setShowWarningModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <style>{`
        @keyframes floatingMist {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) translateX(15px);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationManagement;