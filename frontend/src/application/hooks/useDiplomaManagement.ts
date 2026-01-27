import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { diplomaService } from '../services/diploma.service';
import { Filters } from '../../domain/types/management/diplomamanagement';

export const useDiplomaManagement = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    status: 'all',
    dateRange: 'all',
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
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

  const { data: coursesData, isLoading: isLoadingCourses, error: coursesError } = useQuery({
    queryKey: ['diploma-courses', page, filters, limit],
    queryFn: () => {
      const dateRange = getDateRangeFilter(filters.dateRange);
      return diplomaService.getDiplomaCourses(
        page,
        limit,
        filters.category !== 'all' ? filters.category : undefined,
        filters.status !== 'all' ? filters.status : undefined,
        dateRange
      );
    }
  });

  const { data: selectedCourse, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['diploma-course', selectedCourseId],
    queryFn: () => {
      if (!selectedCourseId) throw new Error('No course ID provided');
      return diplomaService.getDiplomaCourseById(selectedCourseId);
    },
    enabled: !!selectedCourseId,
  });

  const { data: selectedChapter, isLoading: isLoadingChapter } = useQuery({
    queryKey: ['diploma-chapter', selectedCourseId, selectedChapterId],
    queryFn: () => {
      if (!selectedCourseId || !selectedChapterId) throw new Error('No course or chapter ID provided');
      return diplomaService.getChapterById(selectedCourseId, selectedChapterId);
    },
    enabled: !!selectedCourseId && !!selectedChapterId,
  });

  const { data: completedChapters = [], isLoading: isLoadingCompletedChapters } = useQuery({
    queryKey: ['completed-chapters', selectedCourseId],
    queryFn: () => {
      if (!selectedCourseId) throw new Error('No course ID provided');
      return diplomaService.getCompletedChapters(selectedCourseId);
    },
    enabled: !!selectedCourseId,
  });

  const { data: bookmarkedChapters = [], isLoading: isLoadingBookmarkedChapters } = useQuery({
    queryKey: ['bookmarked-chapters', selectedCourseId],
    queryFn: () => {
      if (!selectedCourseId) throw new Error('No course ID provided');
      return diplomaService.getBookmarkedChapters(selectedCourseId);
    },
    enabled: !!selectedCourseId,
  });

  const { mutate: updateProgress } = useMutation({
    mutationFn: ({ courseId, chapterId, progress }: { courseId: string; chapterId: string; progress: number }) =>
      diplomaService.updateVideoProgress(courseId, chapterId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diploma-course', selectedCourseId] });
      toast.success('Progress updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update progress');
    },
  });

  const { mutate: markChapterComplete } = useMutation({
    mutationFn: ({ courseId, chapterId }: { courseId: string; chapterId: string }) =>
      diplomaService.markChapterComplete(courseId, chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completed-chapters', selectedCourseId] });
      queryClient.invalidateQueries({ queryKey: ['diploma-course', selectedCourseId] });
      toast.success('Chapter marked as complete');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark chapter as complete');
    },
  });

  const { mutate: toggleBookmark } = useMutation({
    mutationFn: ({ courseId, chapterId }: { courseId: string; chapterId: string }) =>
      diplomaService.toggleBookmark(courseId, chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarked-chapters', selectedCourseId] });
      toast.success('Bookmark toggled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle bookmark');
    },
  });

  const handleViewCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleViewChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
  };

  return {
    courses: coursesData?.data || [],
    totalPages: coursesData?.totalPages || 0,
    page,
    setPage,
    filters,
    setFilters,
    isLoading: isLoadingCourses || isLoadingCourse || isLoadingChapter || isLoadingCompletedChapters || isLoadingBookmarkedChapters,
    error: coursesError,
    selectedCourse,
    selectedChapter,
    completedChapters: new Set(completedChapters),
    bookmarkedChapters: new Set(bookmarkedChapters),
    updateProgress,
    markChapterComplete,
    toggleBookmark,
    handleViewCourse,
    handleViewChapter,
    setSelectedCourseId,
    setSelectedChapterId,
  };
};