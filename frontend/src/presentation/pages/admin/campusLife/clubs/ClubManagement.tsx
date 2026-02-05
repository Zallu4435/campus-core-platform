import React, { useState, useCallback } from 'react';
import {
  IoAdd as Plus,
  IoEyeOutline as Eye,
  IoCreateOutline as Edit,
  IoTrashOutline as Trash2,
  IoBusinessOutline as Building,
} from 'react-icons/io5';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';
import Header from '../../../../components/admin/management/Header';
import ApplicationsTable from '../../../../components/admin/management/ApplicationsTable';
import Pagination from '../../../../components/admin/management/Pagination';
import WarningModal from '../../../../components/common/WarningModal';
import AddClubModal from './AddClubModal';
import ClubDetailsModal from './ClubDetailsModal';
import ClubRequestDetailsModal from './ClubRequestDetailsModal';
import { useClubManagement } from '../../../../../application/hooks/useClubManagement';
import { Club, ClubRequest } from '../../../../../domain/types/management/clubmanagement';
import { ClubActionConfig, ClubFormData, ItemAction } from '../../../../../domain/types/management/clubmanagement';
import {
  adaptDomainClubToManagement,
  adaptDomainClubRequestToManagement,
  isDomainClub,
  isDomainClubRequest
} from '../../../../../domain/adapters/clubTypeAdapter';
import { CATEGORIES, CLUB_STATUSES, REQUEST_STATUSES, DATE_RANGES, ICONS, COLORS, clubColumns, clubRequestColumns, isAxiosErrorWithApiError } from '../../../../../shared/constants/clubManagementConstants';
import LoadingSpinner from '../../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../../shared/components/ErrorMessage';
import { ClubRequestDetails } from '../../../../../domain/types/management/clubmanagement';


const AdminClubManagement: React.FC = () => {
  const {
    clubs,
    clubRequests,
    totalClubs,
    totalRequests,
    totalPages,
    page,
    setPage,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    createClub,
    updateClub,
    deleteClub,
    approveClubRequest,
    rejectClubRequest,
    handleTabChange,
    getClubDetails,
    getClubRequestDetails,
    isLoadingClubDetails,
  } = useClubManagement();

  const [activeTab, setActiveTab] = useState<'clubs' | 'requests'>('clubs');
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [showClubDetailsModal, setShowClubDetailsModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | ClubRequest | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [itemToAction, setItemToAction] = useState<ItemAction | null>(null);
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ClubRequestDetails | ClubRequest | null>(null);

  const [searchInput, setSearchInput] = useState(searchQuery);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleAddClub = () => {
    setSelectedClub(null);
    setShowAddClubModal(true);
  };

  function isClub(item: Club | ClubRequest): item is Club {
    return isDomainClub(item);
  }
  function isClubRequest(item: Club | ClubRequest): item is ClubRequest {
    return isDomainClubRequest(item);
  }

  const handleEditClub = (club: Club | ClubRequest) => {
    if (!isClub(club)) return;
    (async () => {
      try {
        const id = club.id || club._id;
        if (!id) {
          toast.error('Club ID not found');
          return;
        }
        const details = await getClubDetails(id);
        setSelectedClub(details);
        setShowAddClubModal(true);
      } catch (error) {
        console.error('Error fetching club details:', error);
        toast.error('Failed to fetch club details');
      }
    })();
  };

  const handleViewClub = (club: Club | ClubRequest) => {
    (async () => {
      try {
        if (isClub(club)) {
          const id = club.id || club._id;
          if (!id) {
            toast.error('Club ID not found');
            return;
          }
          const details = await getClubDetails(id);
          setSelectedClub(details);
        } else {
          setSelectedClub(club);
        }
        setShowClubDetailsModal(true);
      } catch (error) {
        console.error('Error fetching club details:', error);
        toast.error('Failed to fetch club details');
      }
    })();
  };

  const handleViewRequest = (request: Club | ClubRequest) => {
    if (!isClubRequest(request)) return;
    (async () => {
      try {
        const id = request.requestedId || request._id;
        if (!id) {
          toast.error('Request ID not found');
          return;
        }
        const details = await getClubRequestDetails(id);
        setSelectedRequest(details);
        setShowRequestDetailsModal(true);
      } catch (error) {
        console.error('Error fetching request details:', error);
        toast.error('Failed to fetch request details');
      }
    })();
  };

  const handleSaveClub = async (data: ClubFormData) => {
    try {
      if (selectedClub && isClub(selectedClub)) {
        const id = selectedClub.id || selectedClub._id;
        if (!id) {
          toast.error('Club ID not found');
          return;
        }
        await updateClub({ id, data });
        toast.success('Club updated successfully');
      } else {
        await createClub({ ...data, members: data.members || [], createdAt: new Date().toISOString() });
        toast.success('Club created successfully');
      }
      setShowAddClubModal(false);
      setSelectedClub(null);
    } catch (error) {
      // Error toast is now handled by the form component
      throw error;
    }
  };

  const handleDeleteClub = (id: string) => {
    setItemToAction({ id, type: 'club', action: 'delete' });
    setShowWarningModal(true);
  };

  const handleApproveRequest = (id: string) => {
    setItemToAction({ id, type: 'request', action: 'approve' });
    setShowWarningModal(true);
  };

  const handleRejectRequest = (id: string) => {
    setItemToAction({ id, type: 'request', action: 'reject' });
    setShowWarningModal(true);
  };

  const handleConfirmAction = async () => {
    if (itemToAction) {
      try {
        if (itemToAction.type === 'club' && itemToAction.action === 'delete') {
          await deleteClub(itemToAction.id);
          toast.success('Club deleted successfully');
        } else if (itemToAction.type === 'request') {
          if (itemToAction.action === 'reject') {
            await rejectClubRequest(itemToAction.id);
            toast.success('Club request rejected');
          } else if (itemToAction.action === 'approve') {
            await approveClubRequest(itemToAction.id);
            toast.success('Club request approved');
          }
          setShowRequestDetailsModal(false);
          setSelectedRequest(null);
        }
        setShowWarningModal(false);
        setItemToAction(null);
        handleTabChange(activeTab);
      } catch (error) {
        if (isAxiosErrorWithApiError(error)) {
          toast.error(error.response?.data?.message || error.message || 'Failed to perform action');
        } else {
          toast.error('Failed to perform action');
        }
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
      category: 'All',
      status: 'All',
      dateRange: 'All',
    });
    setSearchInput('');
    setPage(1);
  };

  const clubActions: ClubActionConfig[] = [
    {
      icon: <Eye size={16} />,
      label: 'View Club',
      onClick: handleViewClub,
      color: 'blue' as const,
      disabled: isLoadingClubDetails,
    },
    {
      icon: <Edit />,
      label: 'Edit Club',
      onClick: handleEditClub,
      color: 'green' as const,
      disabled: isLoadingClubDetails,
    },
    {
      icon: <Trash2 />,
      label: 'Delete Club',
      onClick: (club: Club | ClubRequest) => {
        if (isClub(club) && club.id) handleDeleteClub(club.id);
      },
      color: 'red' as const,
    },
  ];

  const clubRequestActions: ClubActionConfig[] = [
    {
      icon: <Eye size={16} />,
      label: 'View Request',
      onClick: handleViewRequest,
      color: 'blue' as const,
      disabled: isLoadingClubDetails,
    },
    {
      icon: <Edit size={16} />,
      label: 'Approve Request',
      onClick: (item: Club | ClubRequest) => {
        if (isClubRequest(item) && item.requestedId) handleApproveRequest(item.requestedId);
      },
      color: 'green' as const,
      disabled: (item: Club | ClubRequest) => isClubRequest(item) ? item.status !== 'pending' || isLoadingClubDetails : true,
    },
    {
      icon: <Trash2 size={16} />,
      label: 'Reject Request',
      onClick: (item: Club | ClubRequest) => {
        if (isClubRequest(item) && item.requestedId) handleRejectRequest(item.requestedId);
      },
      color: 'red' as const,
      disabled: (item: Club | ClubRequest) => isClubRequest(item) ? item.status !== 'pending' || isLoadingClubDetails : true,
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorMessage message={error.message} />;
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
          title="Club Management"
          subtitle="Manage campus clubs and club requests"
          stats={[
            {
              icon: <Building />,
              title: 'Total Clubs',
              value: totalClubs.toString(),
              change: '+10%',
              isPositive: true,
            },
            {
              icon: <Edit />,
              title: 'Total Requests',
              value: totalRequests.toString(),
              change: '+5%',
              isPositive: true,
            },
            {
              icon: <Building />,
              title: 'Active Clubs',
              value: clubs.filter((c: Club) => c.status && c.status.toLowerCase() === 'active').length.toString(),
              change: '+8%',
              isPositive: true,
            },
          ]}
          tabs={[
            { label: 'Clubs', icon: <Building size={16} />, active: activeTab === 'clubs' },
            { label: 'Club Requests', icon: <Edit size={16} />, active: activeTab === 'requests' },
          ]}
          searchQuery={searchInput}
          setSearchQuery={setSearchInput}
          searchPlaceholder="Search clubs or requests..."
          filters={filters}
          filterOptions={{
            category: CATEGORIES,
            status: activeTab === 'clubs' ? CLUB_STATUSES : REQUEST_STATUSES,
            dateRange: DATE_RANGES,
          }}
          debouncedFilterChange={debouncedFilterChange}
          handleResetFilters={handleResetFilters}
          onTabClick={(index) => {
            const tabMap = ['clubs', 'requests'];
            const newTab = tabMap[index] as 'clubs' | 'requests';
            setActiveTab(newTab);
            handleTabChange(newTab);
            setFilters({
              category: 'All',
              status: 'All',
              dateRange: 'All',
            });
            setSearchInput('');
          }}
        />

        <div className="mt-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-purple-500/20">
            <div className="px-6 py-5">
              {activeTab === 'clubs' && (
                <button
                  onClick={handleAddClub}
                  className="mb-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  aria-label="Add new club"
                >
                  <Plus size={16} />
                  Add Club
                </button>
              )}

              {activeTab === 'clubs' && clubs.length > 0 && (
                <>
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <ApplicationsTable
                      data={clubs.map(adaptDomainClubToManagement)}
                      columns={clubColumns}
                      actions={clubActions}
                    />
                  )}
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onFirstPage={() => setPage(1)}
                    onLastPage={() => setPage(totalPages)}
                  />
                </>
              )}
              {activeTab === 'requests' && clubRequests.length > 0 && (
                <>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                  ) : (
                    <ApplicationsTable
                      data={clubRequests.map(adaptDomainClubRequestToManagement)}
                      columns={clubRequestColumns}
                      actions={clubRequestActions}
                    />
                  )}
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onFirstPage={() => setPage(1)}
                    onLastPage={() => setPage(totalPages)}
                  />
                </>
              )}
              {activeTab === 'clubs' && clubs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                    <Building size={32} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">No Clubs Found</h3>
                  <p className="text-gray-400 text-center max-w-sm">
                    There are no clubs matching your current filters. Try adjusting your search criteria.
                  </p>
                </div>
              )}
              {activeTab === 'requests' && clubRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                    <Edit size={32} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">No Club Requests Found</h3>
                  <p className="text-gray-400 text-center max-w-sm">
                    There are no club requests matching your current filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddClubModal
        isOpen={showAddClubModal}
        onClose={() => {
          setShowAddClubModal(false);
        }}
        onSubmit={handleSaveClub}
        initialData={
          selectedClub
            ? {
              name: selectedClub.name,
              type: selectedClub.type,
              members: isClub(selectedClub)
                ? (Array.isArray(selectedClub.members) ? selectedClub.members.join(', ') : selectedClub.members || '')
                : (selectedClub as ClubRequest).members || '',
              icon: selectedClub.icon,
              color: selectedClub.color,
              status: selectedClub.status as 'active' | 'inactive',
              role: selectedClub.role,
              nextMeeting: selectedClub.nextMeeting,
              about: selectedClub.about,
              createdBy: isClub(selectedClub) ? (selectedClub as Club).createdBy || '' : (selectedClub as ClubRequest).requestedBy || '',
              upcomingEvents: selectedClub.upcomingEvents,
            }
            : undefined
        }
        isEditing={!!selectedClub}
        clubTypes={CATEGORIES.filter((type) => type !== 'All')}
        roles={['Admin', 'President', 'Advisor']}
        icons={ICONS}
        colors={COLORS}
      />

      <ClubDetailsModal
        isOpen={showClubDetailsModal}
        onClose={() => {
          setShowClubDetailsModal(false);
          setSelectedClub(null);
        }}
        club={selectedClub ? (isClub(selectedClub) ? adaptDomainClubToManagement(selectedClub) : adaptDomainClubRequestToManagement(selectedClub)) : null}
        onEdit={handleEditClub}
      />

      <ClubRequestDetailsModal
        isOpen={showRequestDetailsModal}
        onClose={() => {
          setShowRequestDetailsModal(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onApprove={(id) => handleApproveRequest(id)}
        onReject={(id) => handleRejectRequest(id)}
      />

      <WarningModal
        isOpen={showWarningModal}
        onClose={() => {
          setShowWarningModal(false);
          setItemToAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={
          itemToAction?.type === 'club'
            ? 'Delete Club'
            : itemToAction?.action === 'approve'
              ? 'Approve Club Request'
              : 'Reject Club Request'
        }
        message={
          itemToAction?.type === 'club'
            ? 'Are you sure you want to delete this club? This action cannot be undone.'
            : itemToAction?.action === 'approve'
              ? 'Are you sure you want to approve this club request?'
              : 'Are you sure you want to reject this club request?'
        }
        confirmText={
          itemToAction?.type === 'club'
            ? 'Delete'
            : itemToAction?.action === 'approve'
              ? 'Approve'
              : 'Reject'
        }
        cancelText="Cancel"
        type={itemToAction?.action === 'approve' ? 'info' : 'warning'}
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

export default AdminClubManagement;