import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { universitySessionService } from '../services/universitySession.service';
import { UniversitySession } from '../../domain/types/canvas/session';

export const useUniversitySessionManagement = (initialFilters = { status: 'all', instructor: 'all' }, initialSearchTerm = '') => {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<UniversitySession | null>(null);
  const [filters, setFilters] = useState<{ status: string; instructor: string }>(initialFilters);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const getBackendStatus = (frontendStatus: string): string => {
    switch (frontendStatus) {
      case 'upcoming':
        return 'Scheduled';
      case 'live':
        return 'Ongoing';
      case 'ended':
        return 'Ended';
      default:
        return frontendStatus;
    }
  };

  const backendStatus = getBackendStatus(filters.status);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['universitySessions', { status: backendStatus, instructor: filters.instructor, search: debouncedSearchTerm }],
    queryFn: () => universitySessionService.getSessions({ status: backendStatus, instructor: filters.instructor, search: debouncedSearchTerm })
  });

  const sessions = data?.sessions || [];
  const watchedCount = data?.watchedCount || 0;

  const joinSessionMutation = useMutation({
    mutationFn: ({ sessionId, userId }: { sessionId: string, userId: string }) => universitySessionService.joinSession(sessionId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universitySessions'] });
    }
  });

  const handleJoinSession = useCallback(async (sessionId: string, userId: string) => {
    try {
      await joinSessionMutation.mutateAsync({ sessionId, userId });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to join session' };
    }
  }, [joinSessionMutation]);

  return {
    sessions,
    watchedCount,
    isLoading,
    error,
    selectedSession,
    setSelectedSession,
    handleJoinSession,
    isJoining: joinSessionMutation.isPending,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    isFetching,
  };
};