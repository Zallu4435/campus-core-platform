import React, { useState, useCallback, useEffect } from 'react';
import { FiHelpCircle, FiClock, FiCheckSquare } from 'react-icons/fi';
import { debounce } from 'lodash';
import Header from '../../../components/admin/management/Header';
import ApplicationsTable from '../../../components/admin/management/ApplicationsTable';
import Pagination from '../../../components/admin/management/Pagination';
import WarningModal from '../../../components/common/WarningModal';
import EnquiryDetailsModal from './EnquiryDetailsModal';
import { useEnquiryManagement } from '../../../../application/hooks/useEnquiryManagement';
import { Enquiry, EnquiryStatus } from '../../../../domain/types/management/enquirymanagement';
import ReplyModal from './ReplyModal';
import { toast } from 'react-hot-toast';
import {
  ENQUIRY_STATUSES,
  ENQUIRY_COLUMNS,
  ENQUIRY_ACTIONS,
  ENQUIRY_STATS,
  ENQUIRY_TABS,
  getDateRangeFromKeyword,
} from '../../../../shared/constants/enquiryManagementConstants';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';
import EmptyState from '../../../../shared/components/EmptyState';

const EnquiryManagement: React.FC = () => {
  const {
    enquiries,
    totalPages,
    page,
    setPage,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    customDateRange,
    setCustomDateRange,
    deleteEnquiry,
    updateEnquiryStatus,
    resetFilters,
    sendReply,
    isLoading,
    error,
  } = useEnquiryManagement();

  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null);
  const [showEnquiryDetails, setShowEnquiryDetails] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [enquiryToReply, setEnquiryToReply] = useState<Enquiry | null>(null);

  const debouncedFilterChange = useCallback(
    debounce((field: string, value: string) => {
      if (field === 'dateRange') {
        if (value === 'all') {
          setCustomDateRange({ startDate: '', endDate: '' });
        } else if (value === 'custom') {
        } else {
          const { startDate, endDate } = getDateRangeFromKeyword(value);
          setCustomDateRange({ startDate, endDate });
        }
        setFilters((prev) => ({ ...prev, [field]: value }));
        setPage(1);
      } else {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setPage(1);
      }
    }, 300),
    [setFilters, setCustomDateRange, setPage]
  );

  const handleCustomDateChange = useCallback((field: 'startDate' | 'endDate', value: string) => {
    setCustomDateRange(prev => ({ ...prev, [field]: value }));
    setPage(1);
  }, [setCustomDateRange, setPage]);


  const handleConfirmDelete = async () => {
    if (enquiryToDelete) {
      try {
        await deleteEnquiry(enquiryToDelete.id);
        setShowDeleteWarning(false);
        setEnquiryToDelete(null);
      } catch (error) {
        console.error('Failed to delete enquiry:', error);
      }
    }
  };

  const handleUpdateStatus = async (enquiryId: string, status: string) => {
    try {
      await updateEnquiryStatus({ id: enquiryId, status });
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry({ ...selectedEnquiry, status: status as EnquiryStatus });
      }
    } catch (error) {
      console.error('Failed to update enquiry status:', error);
    }
  };

  const handleSendReply = async (enquiryId: string, replyMessage: string) => {
    try {
      await sendReply({ id: enquiryId, replyMessage });
      setShowReplyModal(false);
      setEnquiryToReply(null);
    } catch (error) {
    }
  };


  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Header
          title="Enquiry Management"
          subtitle="Manage and respond to user enquiries"
          stats={[
            {
              icon: ENQUIRY_TABS[0].icon,
              title: 'Total Enquiries',
              value: ENQUIRY_STATS(enquiries).total?.toString() || '0',
              change: '+5.2%',
              isPositive: true,
            },
            {
              icon: <FiClock />,
              title: 'Pending',
              value: ENQUIRY_STATS(enquiries).pending?.toString() || '0',
              change: '-2.1%',
              isPositive: true,
            },
            {
              icon: <FiCheckSquare />,
              title: 'Resolved',
              value: ENQUIRY_STATS(enquiries).resolved?.toString() || '0',
              change: '+3.8%',
              isPositive: true,
            },
          ]}
          tabs={ENQUIRY_TABS}
          searchQuery={searchInput}
          setSearchQuery={setSearchInput}
          searchPlaceholder="Search by name, email, or subject..."
          filters={filters as any}
          filterOptions={{
            status: ENQUIRY_STATUSES,
          }}
          debouncedFilterChange={debouncedFilterChange}
          customDateRange={customDateRange}
          handleCustomDateChange={handleCustomDateChange}
          handleResetFilters={() => {
            resetFilters();
          }}
        />
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-purple-500/20 mt-8">
          <div className="px-6 py-5">
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error.message || 'Failed to load enquiries.'} />
            ) : enquiries.length > 0 ? (
              <>
                <ApplicationsTable
                  data={enquiries}
                  columns={ENQUIRY_COLUMNS}
                  actions={(ENQUIRY_ACTIONS).map((action, idx) => ({
                    ...action,
                    onClick: idx === 0
                      ? (item: Enquiry) => {
                        setSelectedEnquiry(item);
                        setShowEnquiryDetails(true);
                      }
                      : idx === 1
                        ? (item: Enquiry) => {
                          setEnquiryToReply(item);
                          setShowReplyModal(true);
                        }
                        : (item: Enquiry) => {
                          setEnquiryToDelete(item);
                          setShowDeleteWarning(true);
                        },
                  }))}
                />
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  itemsCount={enquiries.length}
                  itemName="enquiries"
                  onPageChange={(newPage: number) => setPage(newPage)}
                  onFirstPage={() => setPage(1)}
                  onLastPage={() => setPage(totalPages)}
                />
              </>
            ) : (
              <EmptyState
                icon={<FiHelpCircle size={32} className="text-purple-400" />}
                title="No Enquiries Found"
                message="There are no enquiries matching your current filters. Try adjusting your search criteria."
              />
            )}
          </div>
        </div>

        <WarningModal
          isOpen={showDeleteWarning}
          onClose={() => {
            setShowDeleteWarning(false);
            setEnquiryToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Enquiry"
          message={enquiryToDelete ? `Are you sure you want to delete the enquiry from "${enquiryToDelete.name}"? This action cannot be undone.` : ''}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>

      <EnquiryDetailsModal
        isOpen={showEnquiryDetails}
        onClose={() => {
          setShowEnquiryDetails(false);
          setSelectedEnquiry(null);
        }}
        enquiry={selectedEnquiry}
        onUpdateStatus={handleUpdateStatus}
      />

      {showReplyModal && enquiryToReply && (
        <ReplyModal
          enquiry={enquiryToReply}
          onClose={() => {
            setShowReplyModal(false);
            setEnquiryToReply(null);
          }}
          onSend={handleSendReply}
        />
      )}
    </>
  );
};

export default EnquiryManagement; 