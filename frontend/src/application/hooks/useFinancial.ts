import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Payment } from '../../domain/types/management/financialmanagement';
import { financialService } from '../services/financialService';
import { toast } from 'react-hot-toast';
import { Charge } from '../../domain/types/management/financialmanagement';

export const usePaymentsManagement = (
  page: number = 1,
  itemsPerPage: number = 10,
  filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    studentId?: string;
  } = {},
  searchQuery: string = '',
  activeTab: string = 'all',
  enabled: boolean = true
) => {
  const queryClient = useQueryClient();
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const { data: paymentsData, isLoading, error } = useQuery<{ data: Payment[]; totalPages: number }, Error>({
    queryKey: ['payments', page, filters, searchQuery, activeTab],
    queryFn: () => financialService.getAllPayments({
      ...filters,
      studentId: searchQuery || filters.studentId || undefined,
      status: (filters.status && filters.status !== 'All Statuses' && filters.status !== 'payments' && filters.status !== 'financialAid' && filters.status !== 'scholarships') ? filters.status : undefined,
      page,
      limit: itemsPerPage,
    }),
    enabled,
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: import('../../domain/types/management/financialmanagement').PaymentForm) =>
      financialService.makePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create payment');
    },
  });

  const { data: paymentDetails, isLoading: isLoadingPaymentDetails } = useQuery<Payment, Error>({
    queryKey: ['paymentDetails', selectedPaymentId],
    queryFn: () => financialService.getPaymentDetails(selectedPaymentId || ''),
    enabled: !!selectedPaymentId,
  });

  const handleViewPayment = useCallback((id: string) => {
    setSelectedPaymentId(id);
  }, []);

  const handleEditPayment = useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['paymentDetails', id],
      queryFn: () => financialService.getPaymentDetails(id),
    });
  }, [queryClient]);

  return {
    payments: paymentsData?.data || [],
    totalPages: Number(paymentsData?.totalPages) || 1,
    isLoading,
    error,
    createPayment: createPaymentMutation.mutate,
    isCreatingPayment: createPaymentMutation.isPending,
    createPaymentError: createPaymentMutation.error,
    paymentDetails,
    isLoadingPaymentDetails,
    handleViewPayment,
    handleEditPayment,
    getStudentFinancialInfo: financialService.getStudentFinancialInfo,
    getFinancialAidApplications: financialService.getFinancialAidApplications,
    applyForFinancialAid: financialService.applyForFinancialAid,
    uploadDocument: financialService.uploadDocument,
    loading: isLoading,
  };
};

export const useChargesManagement = (searchQuery: string = '', isOpen: boolean = false) => {
  const queryClient = useQueryClient();
  const [selectedChargeId, setSelectedChargeId] = useState<string | null>(null);

  const { data: charges = [], isLoading } = useQuery<Charge[]>({
    queryKey: ['charges', searchQuery, isOpen],
    queryFn: async () => {
      if (!isOpen) return [];
      return await financialService.getCharges({
        search: searchQuery,
        page: 1,
        limit: 50,
      });
    },
    enabled: isOpen,
  });

  const updateChargeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Charge> }) => financialService.updateCharge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges'] });
      toast.success('Charge updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update charge');
    },
  });

  const deleteChargeMutation = useMutation({
    mutationFn: (id: string) => financialService.deleteCharge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges'] });
      toast.success('Charge deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete charge');
    },
  });

  return {
    charges,
    isLoading,
    updateCharge: updateChargeMutation.mutate,
    deleteCharge: deleteChargeMutation.mutate,
    setSelectedChargeId,
    selectedChargeId,
  };
};