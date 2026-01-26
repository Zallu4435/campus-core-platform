import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { sportsService } from '../services/sports.service';
import { Team, TeamApiResponseSingle, PlayerRequest, SportRequestDetails, Filters, SportsApiResponse } from '../../domain/types/management/sportmanagement';

// Filters interface is now imported from domain types

export const useSportsManagement = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<Filters>({
    sportType: 'all',
    status: 'all',
    dateRange: 'all',
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'teams' | 'requests'>('teams');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const limit = 10;

  const getDateRangeFilter = (dateRange: string): string | undefined => {
    if (!dateRange || dateRange === 'all') return undefined;

    const now = new Date();
    const startDate = new Date();

    switch (dateRange.toLowerCase()) {
      case 'last_week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last_month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'last_3_months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'last_6_months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'last_year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return undefined;
    }

    const dateRangeString = `${startDate.toISOString()},${now.toISOString()}`;
    return dateRangeString;
  };

  const { data: teamsData, isLoading: isLoadingTeams, error: teamsError } = useQuery<SportsApiResponse<Team>['data']>({
    queryKey: ['teams', page, filters, searchTerm, limit],
    queryFn: async (): Promise<SportsApiResponse<Team>['data']> => {
      const dateRange = getDateRangeFilter(filters.dateRange);
      const data = await sportsService.getTeams(
        page,
        limit,
        filters.sportType !== 'all' ? filters.sportType : undefined,
        filters.status !== 'all' ? filters.status : undefined,
        undefined,
        dateRange,
        searchTerm && searchTerm.trim() !== '' ? searchTerm : undefined
      );
      if (data && data.data) {
        return {
          ...data,
          data: data.data.map((team: Team) => ({
            ...team,
            id: team.id || team._id || '',
            _id: team._id || team.id || '',
            name: team.name || team.title || '',
            title: team.title || team.name || '',
            participants: team.participants || team.playerCount || 0,
            playerCount: team.playerCount || team.participants || 0,
            formedOn: team.formedOn || team.createdAt || '',
            createdAt: team.createdAt || team.formedOn || '',
          }))
        };
      }
      return data;
    },
    enabled: activeTab === 'teams',
  });

  const { data: playerRequestsData, isLoading: isLoadingPlayerRequests, error: playerRequestsError } = useQuery<SportsApiResponse<PlayerRequest>['data']>({
    queryKey: ['playerRequests', page, filters, searchTerm, limit],
    queryFn: async (): Promise<SportsApiResponse<PlayerRequest>['data']> => {
      const dateRange = getDateRangeFilter(filters.dateRange);
      const data = await sportsService.getPlayerRequests(
        page,
        limit,
        filters.sportType !== 'all' ? filters.sportType : undefined,
        filters.status !== 'all' ? filters.status : undefined,
        dateRange,
        searchTerm && searchTerm.trim() !== '' ? searchTerm : undefined
      );
      if (data && data.data) {
        return {
          ...data,
          data: data.data.map((req: PlayerRequest) => ({
            ...req,
            requestId: req.requestId || req.id || req._id || '',
            id: req.id || req._id || '',
            _id: req._id || req.id || '',
            teamName: req.teamName || req.sportTitle || '',
            sportName: req.sportName || req.sportTitle || '',
            requestedBy: req.requestedBy || req.userName || '',
            requestedAt: req.requestedAt || req.requestedDate || '',
          }))
        };
      }
      return data;
    },
    enabled: activeTab === 'requests',
  });

  const { data: teamDetails, isLoading: isLoadingTeamDetails } = useQuery<TeamApiResponseSingle['data']>({
    queryKey: ['teamDetails', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) throw new Error('No team ID provided');
      const data = await sportsService.getTeamDetails(selectedTeamId);
      if (data && data.sport) {
        const sport = data.sport;
        return {
          ...data,
          sport: {
            ...sport,
            id: sport.id || sport._id || '',
            _id: sport._id || sport.id || '',
            name: sport.name || sport.title || '',
            title: sport.title || sport.name || '',
            participants: sport.participants || sport.playerCount || 0,
            playerCount: sport.playerCount || sport.participants || 0,
            formedOn: sport.formedOn || sport.createdAt || '',
            createdAt: sport.createdAt || sport.formedOn || '',
          }
        };
      }
      return data;
    },
    enabled: !!selectedTeamId,
  });

  const { data: requestDetails, isLoading: isLoadingRequestDetails } = useQuery<SportRequestDetails>({
    queryKey: ['requestDetails', selectedRequestId],
    queryFn: async () => {
      if (!selectedRequestId) throw new Error('No request ID provided');
      const data = await sportsService.getRequestDetails(selectedRequestId);
      // Backend returns sportRequest: { ... }
      if (data && data.sportRequest) {
        const req = data.sportRequest;
        const normalizedRequest: SportRequestDetails = {
          sportRequest: {
            id: req.id || '',
            status: req.status || '',
            createdAt: req.requestedDate || '',
            updatedAt: req.updatedAt || '',
            whyJoin: req.whyJoin || '',
            additionalInfo: req.additionalInfo || '',
            sport: {
              id: req.sportId || '',
              title: req.sportTitle || '',
              type: req.type || '',
              headCoach: req.headCoach || '',
              playerCount: req.playerCount || 0,
              division: req.division || '',
            },
            user: {
              id: req.userId || '',
              name: req.userName || '',
              email: req.userEmail || '',
            },
          }
        };
        return normalizedRequest;
      }
      throw new Error('Failed to load request details');
    },
    enabled: !!selectedRequestId,
  });

  const { mutateAsync: createTeam } = useMutation({
    mutationFn: (data: Omit<Team, 'id'>) => sportsService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create team');
    },
  });

  const { mutateAsync: updateTeam } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Team> }) =>
      sportsService.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update team');
    },
  });

  const { mutateAsync: deleteTeam } = useMutation({
    mutationFn: (id: string) => sportsService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete team');
    },
  });

  const { mutateAsync: approvePlayerRequest } = useMutation({
    mutationFn: (id: string) => sportsService.approvePlayerRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerRequests'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['requestDetails'] });
      toast.success('Player request approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve player request');
    },
  });

  const { mutateAsync: rejectPlayerRequest } = useMutation({
    mutationFn: (id: string) => sportsService.rejectPlayerRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerRequests'] });
      queryClient.invalidateQueries({ queryKey: ['requestDetails'] });
      toast.success('Player request rejected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject player request');
    },
  });

  const handleTabChange = (tab: 'teams' | 'requests') => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleViewTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  const handleEditTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  const handleViewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
  };


  return {
    teams: teamsData?.data || [],
    playerRequests: playerRequestsData?.data || [],
    totalPages: activeTab === 'teams' ? teamsData?.totalPages || 0 : playerRequestsData?.totalPages || 0,
    page,
    setPage,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    isLoading: isLoadingTeams || isLoadingPlayerRequests || isLoadingTeamDetails || isLoadingRequestDetails,
    error: teamsError || playerRequestsError,
    createTeam,
    updateTeam,
    deleteTeam,
    approvePlayerRequest,
    rejectPlayerRequest,
    handleTabChange,
    activeTab,
    teamDetails: teamDetails?.sport,
    handleViewTeam,
    handleEditTeam,
    setSelectedTeamId,
    requestDetails,
    handleViewRequest,
    isLoadingRequestDetails,
  };
};