import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { clubService } from '../services/club.service';
import { Club, ClubRequestsResponse, Filters } from '../../domain/types/management/clubmanagement';

export const useClubManagement = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<Filters>({
    category: 'All',
    status: 'All',
    dateRange: 'All',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'clubs' | 'requests' | 'members'>('clubs');
  const [selectedClubId] = useState<string | null>(null);
  const limit = 10;

  const getDateRangeFilter = (dateRange: string): string | undefined => {
    if (!dateRange || dateRange === 'All') return undefined;

    const now = new Date();
    const startDate = new Date();

    const range = dateRange.toLowerCase();

    switch (range) {
      case 'last_week':
      case 'last week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last_month':
      case 'last month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'last_3_months':
      case 'last 3 months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'last_6_months':
      case 'last 6 months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'last_year':
      case 'last year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return undefined;
    }

    const dateRangeString = `${startDate.toISOString()},${now.toISOString()}`;
    return dateRangeString;
  };

  const { data: clubsData, isLoading: isLoadingClubs, error: clubsError } = useQuery({
    queryKey: ['clubs', page, filters, searchQuery, limit],
    queryFn: () => {
      const dateRange = getDateRangeFilter(filters.dateRange);
      const category = filters.category !== 'All' ? filters.category.toLowerCase().replace(/\s+/g, '_') : undefined;
      const status = filters.status !== 'All' ? filters.status.toLowerCase().replace(/\s+/g, '_') : undefined;
      return clubService.getClubs(
        page,
        limit,
        category,
        status,
        dateRange,
        searchQuery && searchQuery.trim() !== '' ? searchQuery : undefined
      );
    },
    enabled: activeTab === 'clubs',
  });

  const { data: clubRequestsData, isLoading: isLoadingRequests, error: requestsError } = useQuery<ClubRequestsResponse>({
    queryKey: ['clubRequests', page, filters, searchQuery, limit],
    queryFn: () => {
      const dateRange = getDateRangeFilter(filters.dateRange);
      const category = filters.category !== 'All' ? filters.category.toLowerCase().replace(/\s+/g, '_') : undefined;
      const status = filters.status !== 'All' ? filters.status.toLowerCase().replace(/\s+/g, '_') : undefined;
      return clubService.getClubRequests(
        page,
        limit,
        category,
        status,
        dateRange,
        searchQuery && searchQuery.trim() !== '' ? searchQuery : undefined
      );
    },
    enabled: activeTab === 'requests',
  });


  const { data: selectedClub, isLoading: isLoadingClubDetails, error: clubDetailsError } = useQuery({
    queryKey: ['clubDetails', selectedClubId],
    queryFn: () => {
      if (!selectedClubId) return null;
      return clubService.getClubDetails(selectedClubId);
    },
    enabled: !!selectedClubId,
  });

  const { mutateAsync: getClubDetails } = useMutation({
    mutationFn: (id: string) => clubService.getClubDetails(id),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to fetch club details');
    },
  });

  const { mutateAsync: getClubRequestDetails } = useMutation({
    mutationFn: (id: string) => clubService.getClubRequestDetails(id),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to fetch club request details');
    },
  });

  const handleTabChange = (tab: 'clubs' | 'requests' | 'members') => {
    setActiveTab(tab);
    setPage(1);
  };

  const { mutateAsync: createClub } = useMutation({
    mutationFn: (data: Omit<Club, 'id'>) => clubService.createClub(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create club');
    },
  });

  const { mutateAsync: updateClub } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Club> }) =>
      clubService.updateClub(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update club');
    },
  });

  const { mutateAsync: deleteClub } = useMutation({
    mutationFn: (id: string) => clubService.deleteClub(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast.success('Club deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete club');
    },
  });

  const { mutateAsync: approveClubRequest } = useMutation({
    mutationFn: (id: string) => clubService.approveClubRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubRequests', 'clubs'] });
      toast.success('Club request approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve club request');
    },
  });

  const { mutateAsync: rejectClubRequest } = useMutation<void, Error, string>({
    mutationFn: (id: string) => clubService.rejectClubRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubRequests'] });
      toast.success('Club request rejected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject club request');
    },
  });

  return {
    clubs: clubsData?.clubs || [],
    clubRequests: clubRequestsData?.clubRequests || [],
    totalClubs: clubsData?.totalItems || 0,
    totalRequests: clubRequestsData?.totalItems || 0,
    totalPages:
      activeTab === 'clubs'
        ? clubsData?.totalPages || 0
        : activeTab === 'requests'
          ? clubRequestsData?.totalPages || 0
          : 0,
    page,
    setPage,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    isLoading: isLoadingClubs || isLoadingRequests,
    error: clubsError || requestsError,
    createClub,
    updateClub,
    deleteClub,
    approveClubRequest,
    rejectClubRequest,
    handleTabChange,
    getClubDetails,
    getClubRequestDetails,
    selectedClub,
    isLoadingClubDetails,
    clubDetailsError,
  };
};