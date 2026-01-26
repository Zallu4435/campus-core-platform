import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '../services/assignmentService';
import { Assignment, NewAssignment, Submission } from '../../../../../domain/types/faculty/assignment';

export const useAssignmentManagement = ({
    searchTerm,
    filterStatus,
    filterSubject,
    submissionSearch,
    submissionStatus
}: {
    searchTerm: string,
    filterStatus: string,
    filterSubject: string,
    submissionSearch?: string,
    submissionStatus?: string
}) => {
    const queryClient = useQueryClient();
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const { data: assignments, isLoading: isLoadingAssignments, error: assignmentsError } = useQuery({
        queryKey: ['assignments', searchTerm, filterStatus, filterSubject],
        queryFn: () => assignmentService.getAssignments({
            search: searchTerm,
            status: filterStatus,
            subject: filterSubject,
        })
    });

    const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
        queryKey: ['submissions', selectedAssignment?._id, submissionSearch, submissionStatus],
        queryFn: () => selectedAssignment
            ? assignmentService.getSubmissions(selectedAssignment._id, {
                search: submissionSearch,
                status: submissionStatus !== 'all' ? submissionStatus : undefined
            })
            : Promise.resolve({ data: [], total: 0 }),
        enabled: !!selectedAssignment
    });

    const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
        queryKey: ['analytics'],
        queryFn: assignmentService.getAllAnalytics,
        enabled: showAnalytics
    });

    const createAssignmentMutation = useMutation({
        mutationFn: assignmentService.createAssignment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        }
    });

    const updateAssignmentMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Assignment, 'files'>> & { files?: File[] } }) => {
            return assignmentService.updateAssignment(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        }
    });

    const deleteAssignmentMutation = useMutation({
        mutationFn: (id: string) => assignmentService.deleteAssignment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        }
    });

    const reviewSubmissionMutation = useMutation({
        mutationFn: ({ assignmentId, submissionId, reviewData }: {
            assignmentId: string;
            submissionId: string;
            reviewData: {
                marks: number;
                feedback: string;
                status: 'reviewed' | 'pending' | 'needs_correction';
                isLate: boolean;
            };
        }) => assignmentService.reviewSubmission(assignmentId, submissionId, reviewData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        }
    });

    const handleCreateAssignment = useCallback(async (data: NewAssignment) => {
        try {
            await createAssignmentMutation.mutateAsync(data);
            return { success: true };
        } catch (error) {
            console.error('Error creating assignment:', error);
            return { success: false, error: 'Failed to create assignment' };
        }
    }, [createAssignmentMutation]);

    const handleUpdateAssignment = useCallback(async (id: string, data: Partial<Omit<Assignment, 'files'>> & { files?: File[] }) => {
        try {
            const { files, ...assignmentData } = data;
            await updateAssignmentMutation.mutateAsync({ id, data: { ...assignmentData, files } });
            return { success: true };
        } catch (error) {
            console.error('Error updating assignment:', error);
            return { success: false, error: 'Failed to update assignment' };
        }
    }, [updateAssignmentMutation]);

    const handleDeleteAssignment = useCallback(async (id: string) => {
        try {
            await deleteAssignmentMutation.mutateAsync(id);
            return { success: true };
        } catch (error) {
            console.error('Error deleting assignment:', error);
            return { success: false, error: 'Failed to delete assignment' };
        }
    }, [deleteAssignmentMutation]);

    const handleReviewSubmission = useCallback(async (assignmentId: string, submissionId: string, reviewData: { marks: number; feedback: string; status: 'reviewed' | 'pending' | 'needs_correction'; isLate: boolean }) => {
        try {
            await reviewSubmissionMutation.mutateAsync({ assignmentId, submissionId, reviewData });
            return { success: true };
        } catch (error) {
            console.error('Error reviewing submission:', error);
            return { success: false, error: 'Failed to review submission' };
        }
    }, [reviewSubmissionMutation]);


    return {
        assignments: assignments?.data || [],
        submissions: submissions?.data || [],
        analytics,
        selectedAssignment,
        selectedSubmission,
        showAnalytics,
        isLoading: isLoadingAssignments || isLoadingSubmissions || (showAnalytics && isLoadingAnalytics),
        error: assignmentsError,

        setSelectedAssignment,
        setSelectedSubmission,
        setShowAnalytics,

        handleCreateAssignment,
        handleUpdateAssignment,
        handleDeleteAssignment,
        handleReviewSubmission,

        isCreating: createAssignmentMutation.isPending,
        isUpdating: updateAssignmentMutation.isPending,
        isDeleting: deleteAssignmentMutation.isPending,
        isReviewing: reviewSubmissionMutation.isPending
    };
}; 