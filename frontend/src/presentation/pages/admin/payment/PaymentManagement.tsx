import React, { useState, useEffect, useCallback } from 'react';
import { FiDollarSign, FiEye, FiFileText, FiPlus, FiList } from 'react-icons/fi';
import { debounce } from 'lodash';
import { usePaymentsManagement } from '../../../../application/hooks/useFinancial';
import { financialService } from '../../../../application/services/financialService';
import Header from '../../../components/admin/management/Header';
import ApplicationsTable from '../../../components/admin/management/ApplicationsTable';
import Pagination from '../../../components/admin/management/Pagination';
import ReceiptModal from './ReceiptModal';
import ActionModal from './ActionModal';
import AddChargeModal from './AddChargeModal';
import ViewChargesModal from './ViewChargesModal';
import PaymentDetailsModal from './PaymentDetailsModal';
import { Payment, FinancialAidApplication, ScholarshipApplication, Filters } from '../../../../domain/types/management/financialmanagement';
import { STATUSES, TERMS, computeDateRange, paymentColumns } from '../../../../shared/constants/paymentManagementConstants';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';
import EmptyState from '../../../../shared/components/EmptyState';


const PaymentManagement: React.FC = () => {
  const [activeTab] = useState<'payments'>('payments');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({ status: 'All Statuses', term: 'All Terms', startDate: '', endDate: '', dateRange: 'all' });
  const [page, setPage] = useState(1);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptUrl] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedApplication] = useState<FinancialAidApplication | ScholarshipApplication | null>(null);
  const [actionType] = useState<'approve' | 'reject'>('approve');
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [showViewChargesModal, setShowViewChargesModal] = useState(false);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [customDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });

  const {
    payments,
    totalPages,
    isLoading,
    error,
    paymentDetails,
    isLoadingPaymentDetails,
    handleViewPayment,
  } = usePaymentsManagement(
    page,
    10,
    {
      status: filters.status !== 'All Statuses' && filters.status !== 'payments' ? filters.status : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      studentId: searchQuery || undefined,
    },
    searchQuery,
    'payments'
  );


  const fetchData = useCallback(async () => {
    // No additional data fetching needed outside of usePaymentsManagement hook for now
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (showPaymentDetailsModal) {
    }
  }, [showPaymentDetailsModal, paymentDetails, isLoadingPaymentDetails]);


  const handleConfirmAction = async () => {
    if (!selectedApplication) return;
    try {
      if ('term' in selectedApplication) {
      } else {
      }
      setShowActionModal(false);
      fetchData();
    } catch (err: unknown) {
      console.error('Failed to update application:', err);
    }
  };

  const handleAddCharge = async (charge: {
    title: string;
    description: string;
    amount: number;
    term: string;
    dueDate: string;
    applicableFor: string;
  }) => {
    await financialService.createCharge(charge);
    fetchData();
  };

  const handleViewCharges = async () => {
    try {
      setShowViewChargesModal(true);
    } catch (err) {
      console.error('Failed to fetch charges:', err);
    }
  };

  const debouncedFilterChange = useCallback(
    debounce((field: string, value: string) => {
      let actualValue = value;
      if (field === 'status') {
        actualValue = STATUSES.find(s => s.toLowerCase().replace(/\s+/g, '_') === value) || value;
      } else if (field === 'term') {
        actualValue = TERMS.find(t => t.toLowerCase().replace(/\s+/g, '_') === value) || value;
      }
      setFilters((prev) => {
        let updated = { ...prev, [field]: actualValue };
        if (field === 'dateRange') {
          if (value === 'all') {
            updated.startDate = '';
            updated.endDate = '';
          } else if (value === 'custom') {
            updated.startDate = customDateRange.startDate;
            updated.endDate = customDateRange.endDate;
          } else {
            const { startDate, endDate } = computeDateRange(value);
            updated.startDate = startDate;
            updated.endDate = endDate;
          }
        }
        return updated;
      });
      setPage(1);
    }, 300),
    [customDateRange]
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleResetFilters = () => {
    setFilters({ status: 'All Statuses', term: 'All Terms', startDate: '', endDate: '', dateRange: 'all' });
    setPage(1);
  };

  const handleViewPaymentModal = (id: string) => {
    handleViewPayment(id);
    setShowPaymentDetailsModal(true);
  };

  const paymentActions = [
    {
      icon: <FiEye size={16} />,
      label: 'View Details',
      onClick: (payment: Payment) => handleViewPaymentModal(payment.id),
      color: 'blue' as const,
    },
  ];

  if (error) {
    return <ErrorMessage message={error instanceof Error ? error.message : String(error)} />;
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
        <div className="mb-6">
          <Header
            title="Payment Management"
            subtitle="Manage student payments and applications"
            stats={[
              {
                icon: <FiDollarSign />,
                title: 'Total Payments',
                value: payments.length.toString(),
                change: '+4.5%',
                isPositive: true,
              },
              {
                icon: <FiFileText />,
                title: 'Pending Applications',
                value: payments.filter((item: Payment) => item.status === 'Pending').length.toString(),
                change: '+1.2%',
                isPositive: true,
              },
            ]}
            tabs={[
              { label: 'Payments', icon: <FiDollarSign size={16} />, active: true },
            ]}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Search by student ID..."
            filters={filters}
            filterOptions={{
              status: STATUSES,
              dateRange: ['All Dates', 'Last Week', 'Last Month', 'Last 3 Months', 'Custom Range'],
            }}
            debouncedFilterChange={debouncedFilterChange}
            handleResetFilters={handleResetFilters}
            onTabClick={() => {
              setPage(1);
            }}
          />
        </div>

        <div className="mt-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-purple-500/20 min-h-[300px] relative">
            {/* Loading overlay for payment table only */}
            {activeTab === 'payments' && isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 z-20 rounded-xl">
                <LoadingSpinner />
              </div>
            ) : null}
            <div className={`px-6 py-5 ${isLoading ? 'opacity-50 pointer-events-none select-none' : ''}`}>
              {(
                <div className="mb-4 flex justify-start space-x-4">
                  <button
                    onClick={() => setShowAddChargeModal(true)}
                    className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <FiPlus className="mr-2" />
                    Add New Charge
                  </button>
                  <button
                    onClick={handleViewCharges}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <FiList className="mr-2" />
                    View Charges
                  </button>
                </div>
              )}
              {payments.length > 0 ? (
                <>
                  <ApplicationsTable
                    data={payments.map((item: Payment) => ({ ...item, _id: item._id || item.id }))}
                    columns={paymentColumns}
                    actions={paymentActions}
                  />
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    itemsCount={payments.length}
                    itemName="payments"
                    onPageChange={handlePageChange}
                    onFirstPage={() => setPage(1)}
                    onLastPage={() => setPage(totalPages)}
                  />
                </>
              ) : (
                <EmptyState
                  icon={<FiDollarSign size={32} className="text-purple-400" />}
                  title="No Payments Found"
                  message="There are no payments matching your current filters. Try adjusting your search criteria."
                />
              )}
            </div>
          </div>
        </div>

        {showReceiptModal && (
          <ReceiptModal
            isOpen={showReceiptModal}
            onClose={() => setShowReceiptModal(false)}
            receiptUrl={selectedReceiptUrl}
          />
        )}

        {showActionModal && selectedApplication && (
          <ActionModal
            isOpen={showActionModal}
            onClose={() => setShowActionModal(false)}
            onConfirm={handleConfirmAction}
            title={actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
            message={`Are you sure you want to ${actionType} this ${'term' in selectedApplication ? 'financial aid' : 'scholarship'} application for student ${selectedApplication.studentId}? `}
            type={actionType === 'approve' ? 'success' : 'danger'}
          />
        )}

        {showAddChargeModal && (
          <AddChargeModal
            isOpen={showAddChargeModal}
            onClose={() => setShowAddChargeModal(false)}
            onSubmit={handleAddCharge}
          />
        )}

        {showViewChargesModal && (
          <ViewChargesModal
            isOpen={showViewChargesModal}
            onClose={() => setShowViewChargesModal(false)}
          />
        )}

        {showPaymentDetailsModal && (
          <PaymentDetailsModal
            isOpen={showPaymentDetailsModal}
            onClose={() => setShowPaymentDetailsModal(false)}
            payment={paymentDetails || null}
          />
        )}

        <style>{`
          @keyframes floatingMist {
            0% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaymentManagement;