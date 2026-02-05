import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionService, CreateVideoSessionPayload, UpdateVideoSessionPayload, VideoSession } from '../services/session.service';

export type { UpdateVideoSessionPayload };

export const useSessionManagement = (options?: { loadSessions?: boolean }) => {
  const queryClient = useQueryClient();
  const loadSessions = options?.loadSessions !== false;
  const [selectedSession, setSelectedSession] = useState<VideoSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

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
      case 'completed':
        return 'Ended';
      default:
        return frontendStatus;
    }
  };

  const backendStatus = getBackendStatus(filterStatus);
  const { data: sessions = [], isLoading: isLoadingSessions, error: sessionsError } = useQuery<VideoSession[]>({
    queryKey: ['sessions', debouncedSearchTerm, backendStatus, filterCourse],
    queryFn: async () => {
      const data = await sessionService.getSessions({
        search: debouncedSearchTerm,
        status: backendStatus,
        course: filterCourse,
      });
      return data as VideoSession[];
    },
    enabled: loadSessions,
  });

  const createSessionMutation = useMutation({
    mutationFn: sessionService.createVideoSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }: UpdateVideoSessionPayload) => sessionService.updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id: string) => sessionService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  const markSessionAsOverMutation = useMutation({
    mutationFn: (id: string) => sessionService.updateSessionStatus(id, 'Ended'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  const startSessionMutation = useMutation({
    mutationFn: (id: string) => sessionService.updateSessionStatus(id, 'live'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  });

  const handleCreateSession = useCallback(async (data: CreateVideoSessionPayload) => {
    try {
      await createSessionMutation.mutateAsync(data);
      return { success: true };
    } catch (error) {
      console.error('Error creating session:', error);
      return { success: false, error: 'Failed to create session' };
    }
  }, [createSessionMutation]);

  const handleUpdateSession = useCallback(async (id: string, data: Partial<VideoSession>) => {
    try {
      const updateData = {
        ...data,
        duration: typeof data.duration === 'string' ? parseInt(data.duration) || 0 : data.duration
      };
      await updateSessionMutation.mutateAsync({ id, data: updateData });
      return { success: true };
    } catch (error) {
      console.error('Error updating session:', error);
      return { success: false, error: 'Failed to update session' };
    }
  }, [updateSessionMutation]);

  const handleDeleteSession = useCallback(async (id: string) => {
    try {
      await deleteSessionMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting session:', error);
      return { success: false, error: 'Failed to delete session' };
    }
  }, [deleteSessionMutation]);

  const markSessionAsOver = useCallback(async (id: string) => {
    try {
      await markSessionAsOverMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      console.error('Error marking session as over:', error);
      return { success: false, error: 'Failed to mark session as over' };
    }
  }, [markSessionAsOverMutation]);

  const startSession = useCallback(async (id: string) => {
    try {
      await startSessionMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      console.error('Error starting session:', error);
      return { success: false, error: 'Failed to start session' };
    }
  }, [startSessionMutation]);

  const attendanceJoin = useCallback(async (sessionId: string) => {
    try {
      await sessionService.attendanceJoin(sessionId);
      return { success: true };
    } catch (error) {
      console.error('Error joining attendance:', error);
      return { success: false, error: 'Failed to join attendance' };
    }
  }, []);

  const attendanceLeave = useCallback(async (sessionId: string) => {
    try {
      await sessionService.attendanceLeave(sessionId);
      return { success: true };
    } catch (error) {
      console.error('Error leaving attendance:', error);
      return { success: false, error: 'Failed to leave attendance' };
    }
  }, []);

  const useSessionAttendance = (sessionId: string, filters = {}) => {
    const queryKey = ['sessionAttendance', sessionId, filters] as const;
    return useQuery<any[]>({
      queryKey,
      queryFn: () => sessionService.getSessionAttendance(sessionId, filters),
      enabled: !!sessionId,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    });
  };

  const getSessionAttendance = useCallback(async (sessionId: string) => {
    try {
      return await sessionService.getSessionAttendance(sessionId);
    } catch (error) {
      console.error('Error fetching session attendance:', error);
      return null;
    }
  }, []);

  const updateAttendanceStatus = useCallback(async (sessionId: string, userId: string, status: string, name: string) => {
    try {
      await sessionService.updateAttendanceStatus(sessionId, userId, status, name);
      return { success: true };
    } catch (error) {
      console.error('Error updating attendance status:', error);
      return { success: false, error: 'Failed to update attendance status' };
    }
  }, []);

  return {
    sessions: sessions || [],
    isLoading: isLoadingSessions,
    error: sessionsError,
    selectedSession,
    setSelectedSession,
    handleCreateSession,
    handleUpdateSession,
    handleDeleteSession,
    markSessionAsOver,
    startSession,
    isCreating: createSessionMutation.isPending,
    isUpdating: updateSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
    isMarkingAsOver: markSessionAsOverMutation.isPending,
    isStartingSession: startSessionMutation.isPending,
    attendanceJoin,
    attendanceLeave,
    useSessionAttendance,
    getSessionAttendance,
    updateAttendanceStatus,

    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterCourse,
    setFilterCourse,
  };
}; 