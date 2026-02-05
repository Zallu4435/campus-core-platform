import React, { useState, useCallback } from 'react';

import { useUserManagement } from '../../../../application/hooks/useUserManagement';
import { FiUsers, FiClipboard, FiBarChart2, FiEye, FiCheckCircle, FiXCircle, FiSlash } from 'react-icons/fi';
import { debounce } from 'lodash';
import ApprovalModal from './ApprovalModal';
import WarningModal from '../../../components/common/WarningModal';
import Header from '../../../components/admin/management/Header';
import ApplicationsTable from '../../../components/admin/management/ApplicationsTable';
import Pagination from '../../../components/admin/management/Pagination';
import ApplicantDetails from './ApplicantDetails';
import { User } from '../../../../domain/types/management/usermanagement';
import { formatDate } from '../../../../shared/utils/dateUtils';
import {
  PROGRAMS,
  STATUSES,
  userColumns as baseUserColumns,
} from '../../../../shared/constants/userManagementConstants';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';
import EmptyState from '../../../../shared/components/EmptyState';

const userColumns = [
  ...baseUserColumns.slice(0, 3),
  {
    ...baseUserColumns[3],
    render: (user: User) => (
      <div className="flex items-center text-gray-300">
        <span className="text-sm">{formatDate(user.createdAt)}</span>
      </div>
    ),
  },
  {
    ...baseUserColumns[4],
    render: (user: User) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.status.toLowerCase() === 'approved'
          ? 'bg-green-900/30 text-green-400 border-green-500/30'
          : user.status.toLowerCase() === 'rejected'
            ? 'bg-red-900/30 text-red-400 border-red-500/30'
            : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
          }`}
        role="status"
      >
        <span
          className="h-1.5 w-1.5 rounded-full mr-1.5"
          style={{ boxShadow: `0 0 8px currentColor`, backgroundColor: 'currentColor' }}
        ></span>
        {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || 'Pending'}
      </span>
    ),
  },
];

const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customDateRange, setCustomDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedApplicant, setSelectedApplicant] = useState<User | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<User | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [admissionToDelete, setAdmissionToDelete] = useState<User | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    programs: true,
    education: true,
    achievements: true,
    otherInfo: true,
    documents: true,
    declaration: true,
    application: true,
  });
  const [showBlockWarning, setShowBlockWarning] = useState(false);
  const [admissionToBlock, setAdmissionToBlock] = useState<User | null>(null);

  const {
    users,
    totalPages,
    page,
    setPage,
    filters,
    setFilters,
    isLoading,
    error,
    getAdmissionDetails,
    approveAdmission,
    rejectAdmission,
    deleteAdmission,
    blockAdmission,
  } = useUserManagement();

  const debouncedFilterChange = useCallback(
    debounce((field: string, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    }, 500),
    []
  );

  const debouncedSearchChange = useCallback(
    debounce((query: string) => {
      setFilters((prev) => ({ ...prev, search: query }));
      setPage(1);
    }, 500),
    []
  );

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setCustomDateRange((prev) => ({ ...prev, [field]: value }));
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      dateRange: 'custom'
    }));
  };

  const handleViewDetails = async (user: User) => {
    try {
      const details = await getAdmissionDetails(user._id);
      setSelectedApplicant(details);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching admission details:', error);
    }
  };

  const handleActionClick = (user: User) => {
    setSelectedAdmission(user);
    setShowApprovalModal(true);
  };

  const handleApprove = async (data: unknown) => {
    if (!selectedAdmission) return;
    const approvalData = data as {
      programDetails: string;
      startDate: string;
      scholarshipInfo: string;
      additionalNotes: string;
    };
    try {
      await approveAdmission({
        id: selectedAdmission._id,
        approvalData: {
          programDetails: approvalData.programDetails || '',
          startDate: approvalData.startDate || '',
          scholarshipInfo: approvalData.scholarshipInfo || '',
          additionalNotes: approvalData.additionalNotes || '',
        },
      });
      setShowApprovalModal(false);
      setShowDetails(false);
      setSelectedAdmission(null);
    } catch (error) {
      console.error('Error approving admission:', error);
    }
  };

  const handleReject = async (data: unknown) => {
    if (!selectedAdmission) return;
    const rejectData = data as { reason: string };
    try {
      await rejectAdmission({
        id: selectedAdmission._id,
        reason: rejectData.reason || 'Application rejected',
      });
      setShowApprovalModal(false);
      setShowDetails(false);
      setSelectedAdmission(null);
    } catch (error) {
      console.error('Error rejecting admission:', error);
    }
  };

  const handleDelete = async (user: User) => {
    try {
      await deleteAdmission(user._id);
      setShowDeleteWarning(false);
      setAdmissionToDelete(null);
    } catch (error) {
      console.error('Error deleting admission:', error);
    }
  };

  const handleBlock = async (user: User) => {
    try {
      await blockAdmission(user._id);
      setShowBlockWarning(false);
      setAdmissionToBlock(null);
    } catch (error) {
      setShowBlockWarning(false);
      setAdmissionToBlock(null);
      console.error('Error blocking/unblocking user:', error);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      program: 'all',
      dateRange: 'all',
      search: '',
      startDate: '',
      endDate: '',
    });
    setCustomDateRange({ startDate: '', endDate: '' });
    setPage(1);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const userActions = [
    {
      icon: <FiEye size={16} />,
      label: 'View Details',
      onClick: handleViewDetails,
      color: 'blue' as const,
    },
    {
      icon: <FiCheckCircle size={16} />,
      label: 'Review',
      onClick: handleActionClick,
      color: 'green' as const,
      disabled: (user: User) => user.status !== 'pending',
    },
    {
      icon: <FiXCircle size={16} />,
      label: 'Delete',
      onClick: (user: User) => {
        setAdmissionToDelete(user);
        setShowDeleteWarning(true);
      },
      color: 'red' as const,
      disabled: (user: User) => user.status !== 'pending',
    },
    {
      icon: (
        <span className="inline-flex items-center justify-center rounded-full bg-red-600 text-white p-1 shadow" title="Block/Unblock">
          <FiSlash size={16} />
        </span>
      ),
      label: 'Block/Unblock',
      onClick: (user: User) => {
        setAdmissionToBlock(user);
        setShowBlockWarning(true);
      },
      color: 'red' as const,
      disabled: (user: User) => user.status !== 'approved',
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
          title="Admission Management"
          subtitle="Review and process student admission applications"
          stats={[
            {
              icon: <FiUsers />,
              title: 'Total Applications',
              value: users?.length || '0',
              change: '+5.2%',
              isPositive: true,
            },
            {
              icon: <FiClipboard />,
              title: 'Pending',
              value: users?.filter((u) => u.status.toLowerCase() === 'pending').length || '0',
              change: '-2.1%',
              isPositive: true,
            },
            {
              icon: <FiBarChart2 />,
              title: 'Approval Rate',
              value: `${((users?.filter((u) => u.status.toLowerCase() === 'approved').length / users?.length) * 100 || 0).toFixed(2)}%`,
              change: '+3.8%',
              isPositive: true,
            },
          ]}
          tabs={[
            { label: 'All Applications', icon: <FiUsers size={16} />, active: true },
          ]}
          searchQuery={searchQuery}
          setSearchQuery={(query) => {
            setSearchQuery(query);
            debouncedSearchChange(query);
          }}
          searchPlaceholder="Search by name or email..."
          filters={filters}
          filterOptions={{
            status: STATUSES,
            program: PROGRAMS,
          }}
          debouncedFilterChange={debouncedFilterChange}
          customDateRange={customDateRange}
          handleCustomDateChange={handleCustomDateChange}
          handleResetFilters={handleResetFilters}
        />

        <div className="mt-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-purple-500/20">
            <div className="px-6 py-5">
              {users?.length > 0 ? (
                <>
                  <ApplicationsTable
                    data={users as User[]}
                    columns={userColumns}
                    actions={userActions}
                    formatDate={formatDate}
                  />
                  <Pagination
                    page={page}
                    totalPages={totalPages || 1}
                    itemsCount={users.length}
                    itemName="applications"
                    onPageChange={(newPage: number) => setPage(newPage)}
                    onFirstPage={() => setPage(1)}
                    onLastPage={() => setPage(totalPages)}
                  />
                </>
              ) : (
                <EmptyState
                  icon={<FiUsers size={32} className="text-purple-400" />}
                  title="No Applications Found"
                  message="There are no admission applications matching your current filters. Try adjusting your search criteria."
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showDetails && selectedApplicant && (
        <ApplicantDetails
          selectedApplicant={selectedApplicant}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          approveAdmission={handleApprove}
          rejectAdmission={handleReject}
          deleteAdmission={deleteAdmission}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          formatDate={formatDate}
        />
      )}

      {showApprovalModal && selectedAdmission && (
        <ApprovalModal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedAdmission(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={() => {
            setAdmissionToDelete(selectedAdmission);
            setShowApprovalModal(false);
            setShowDeleteWarning(true);
          }}
          applicantName={selectedAdmission.fullName || 'Applicant'}
        />
      )}

      {showDeleteWarning && admissionToDelete && (
        <WarningModal
          isOpen={showDeleteWarning}
          onClose={() => {
            setShowDeleteWarning(false);
            setAdmissionToDelete(null);
          }}
          onConfirm={() => handleDelete(admissionToDelete)}
          title="Delete Application"
          message={`Are you sure you want to delete ${admissionToDelete.fullName}'s application? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {showBlockWarning && admissionToBlock && (
        <WarningModal
          isOpen={showBlockWarning}
          onClose={() => {
            setShowBlockWarning(false);
            setAdmissionToBlock(null);
          }}
          onConfirm={() => handleBlock(admissionToBlock)}
          title={admissionToBlock.blocked ? 'Unblock User' : 'Block User'}
          message={`Are you sure you want to ${admissionToBlock.blocked ? 'unblock' : 'block'} ${admissionToBlock.fullName}? This will ${admissionToBlock.blocked ? 'allow' : 'prevent'} them from logging in.`}
          confirmText={admissionToBlock.blocked ? 'Unblock' : 'Block'}
          cancelText="Cancel"
          type="warning"
        />
      )}

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

export default UserManagement;
