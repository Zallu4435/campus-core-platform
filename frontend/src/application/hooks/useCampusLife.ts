// src/application/hooks/useCampusLife.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campusLifeService } from '../services/campus-life.service';
import { JoinRequest } from '../../domain/types/user/campus-life';

export interface UseCampusLifeOptions {
  activeTab?: string;
  searchTerm?: string;
  typeFilter?: string;
  statusFilter?: string;
  eventSearchTerm?: string;
  sportsSearchTerm?: string;
  sportsStatusFilter?: string;
}

export const useCampusLife = (options: UseCampusLifeOptions = {}) => {
  const {
    activeTab,
    searchTerm,
    typeFilter,
    statusFilter,
    eventSearchTerm,
    sportsSearchTerm,
    sportsStatusFilter,
  } = options;

  const queryClient = useQueryClient();
  const {
    data: events,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useQuery({
    queryKey: ['events', eventSearchTerm || '', statusFilter || 'all', typeFilter || ''],
    queryFn: () => {
      const params: any = {
        status: statusFilter && statusFilter !== '' ? statusFilter : 'all',
      };
      if (eventSearchTerm) params.search = eventSearchTerm;
      if (typeFilter) params.type = typeFilter;

      return campusLifeService.getEvents(params);
    },
    enabled: activeTab === 'Events',
    staleTime: 0,
  });

  const {
    data: sports,
    isLoading: isLoadingSports,
    error: sportsError,
  } = useQuery({
    queryKey: ['sports', sportsSearchTerm || '', sportsStatusFilter || 'all'],
    queryFn: () => {
      const params: any = {
        status: sportsStatusFilter && sportsStatusFilter !== '' ? sportsStatusFilter : 'all'
      };
      if (sportsSearchTerm) params.search = sportsSearchTerm;

      return campusLifeService.getSports(params);
    },
    enabled: activeTab === 'Athletics',
  });

  const {
    data: clubs,
    isLoading: isLoadingClubs,
    error: clubsError,
  } = useQuery({
    queryKey: ['clubs', searchTerm || '', typeFilter || '', statusFilter || 'all'],
    queryFn: () => {
      const params: any = {
        status: statusFilter && statusFilter !== '' ? statusFilter : 'all'
      };
      if (searchTerm) params.search = searchTerm;
      if (typeFilter) params.type = typeFilter;

      return campusLifeService.getClubs(params);
    },
    enabled: activeTab === 'Clubs',
    staleTime: 0,
  });

  const {
    mutateAsync: requestToJoinClubAsync,
    mutate: requestToJoinClub,
    isPending: isJoiningClub,
    error: joinClubError
  } = useMutation({
    mutationFn: ({ clubId, request }: { clubId: string; request: JoinRequest }) =>
      campusLifeService.requestToJoinClub(clubId, request),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['clubs'] });
    },
    onError: (error) => {
      console.error('Club join request failed:', error);
    }
  });

  const {
    mutateAsync: requestToJoinSportAsync,
    mutate: requestToJoinSport,
    isPending: isJoiningSport,
    error: joinSportError
  } = useMutation({
    mutationFn: ({ sportId, request }: { sportId: string; request: JoinRequest }) =>
      campusLifeService.requestToJoinSport(sportId, request),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['sports'] });
    },
    onError: (error) => {
      console.error('Sport join request failed:', error);
    }
  });

  const {
    mutateAsync: requestToJoinEventAsync,
    mutate: requestToJoinEvent,
    isPending: isJoiningEvent,
    error: joinEventError
  } = useMutation({
    mutationFn: ({ eventId, request }: { eventId: string; request: JoinRequest }) =>
      campusLifeService.requestToJoinEvent(eventId, request),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Event registration failed:', error);
    }
  });

  return {
    events: events || [],
    sports: sports || [],
    clubs: clubs || [],

    isLoadingEvents,
    isLoadingSports,
    isLoadingClubs,

    eventsError,
    sportsError,
    clubsError,

    requestToJoinClub,
    requestToJoinSport,
    requestToJoinEvent,
    requestToJoinClubAsync,
    requestToJoinSportAsync,
    requestToJoinEventAsync,

    isJoiningClub,
    isJoiningSport,
    isJoiningEvent,

    joinClubError,
    joinSportError,
    joinEventError
  };
};