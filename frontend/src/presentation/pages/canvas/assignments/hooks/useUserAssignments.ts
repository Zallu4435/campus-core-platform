import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAssignmentService } from '../services/userAssignmentService';
import { SelectedFile, SortOption, FilterStatus } from '../../../../../domain/types/canvas/assignment';

export const useUserAssignments = () => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<SelectedFile>({});
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortBy]);

  const { data: result, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['userAssignments', { search: searchTerm, status: filterStatus, sortBy, page: currentPage, limit: itemsPerPage }],
    queryFn: async () => {
      const result = await userAssignmentService.getAssignments({
        search: searchTerm,
        status: filterStatus,
        sortBy,
        page: currentPage,
        limit: itemsPerPage,
      });
      return result;
    }
  });

  const submitAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, file }: { assignmentId: string; file: File }) => {
      return userAssignmentService.submitAssignment(assignmentId, file);
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['userAssignments'] });
      setSelectedFile(prev => {
        const updated = { ...prev };
        delete updated[variables.assignmentId];
        return updated;
      });
    },
    onError: (error: unknown) => {
      console.error('Mutation: Submission error:', error);
      let errorMsg = 'Failed to submit assignment';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      setError(errorMsg);
    }
  });

  const handleFileSelect = useCallback((assignmentId: string, file: File) => {
    setSelectedFile(prev => ({ ...prev, [assignmentId]: file }));
  }, []);

  const handleSubmit = useCallback(async (assignmentId: string) => {
    const file = selectedFile[assignmentId];
    if (!file) {
      setError('Please select a file to submit');
      return;
    }

    try {
      await submitAssignmentMutation.mutateAsync({ assignmentId, file });
    } catch (error: unknown) {
      console.error('Hook: Submission error:', error);
      let errorMsg = 'Failed to submit assignment';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      setError(errorMsg);
    }
  }, [selectedFile, submitAssignmentMutation]);

  const getAssignmentStatus = useCallback(async (assignmentId: string) => {
    try {
      const status = await userAssignmentService.getAssignmentStatus(assignmentId);
      return status;
    } catch (error: unknown) {
      console.error('Error fetching assignment status:', error);
      return null;
    }
  }, []);

  const getAssignmentFeedback = useCallback(async (assignmentId: string) => {
    try {
      const feedback = await userAssignmentService.getAssignmentFeedback(assignmentId);
      return feedback;
    } catch (error: unknown) {
      console.error('Error fetching assignment feedback:', error);
      return null;
    }
  }, []);

  return {
    assignments: result?.data || [],
    total: result?.total || 0,
    selectedFile,
    error,
    isLoading: isLoadingAssignments || submitAssignmentMutation.isPending,

    handleFileSelect,
    handleSubmit,
    getAssignmentStatus,
    getAssignmentFeedback,

    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    itemsPerPage,

    isSubmitting: submitAssignmentMutation.isPending
  };
}; 