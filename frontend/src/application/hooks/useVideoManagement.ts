import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { diplomaBackendService } from '../services/diplomaBackend.service';
import { toast } from 'react-hot-toast';
import { DiplomaForHook, VideoForHook } from '../../domain/types/management/videomanagement';


export const useVideoManagement = (page: number, itemsPerPage: number, filters: { status: string; category: string; dateRange: string; startDate?: string; endDate?: string }, searchQuery: string) => {
  const queryClient = useQueryClient();

  const { data: diplomasData, isLoading: isLoadingDiplomas } = useQuery<{ diplomas: DiplomaForHook[] }, Error>({
    queryKey: ['diplomas'],
    queryFn: async () => {
      const { diplomas } = await diplomaBackendService.getDiplomas({ page: 1, limit: 100 });
      return { diplomas };
    },
  });

  const { data: videosData, isLoading: isLoadingVideos } = useQuery<{ videos: VideoForHook[]; totalPages: number; statusCounts: { all: number; published: number; drafts: number } }, Error>({
    queryKey: ['videos', page, filters, searchQuery],
    queryFn: () => diplomaBackendService.getVideos(
      filters.category || '',
      page,
      itemsPerPage,
      filters.status || undefined,
      (searchQuery && searchQuery !== 'all') ? searchQuery.trim() : undefined,
      filters.dateRange || undefined,
      filters.startDate,
      filters.endDate
    ),
  });

  const fetchVideoById = useCallback(async (videoId: string): Promise<VideoForHook> => {
    try {
      const video = await diplomaBackendService.getVideoById(videoId);
      return video;
    } catch (error) {
      console.error('Error fetching video by ID:', error);
      throw error;
    }
  }, []);

  const createVideoMutation = useMutation({
    mutationFn: ({ category, videoData }: { category: string; videoData: FormData }) =>
      diplomaBackendService.createVideo(category, videoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['diplomas'] });
      toast.success('Video created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create video');
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: ({ videoId, videoData }: { videoId: string; videoData: Partial<VideoForHook> | FormData }) =>
      diplomaBackendService.updateVideo(videoId, videoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update video');
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (videoId: string) => diplomaBackendService.deleteVideo(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['diplomas'] });
      toast.success('Video deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete video');
    },
  });

  const handleSaveVideo = async (videoData: FormData | Partial<VideoForHook>): Promise<void> => {
    try {
      if (videoData instanceof FormData) {
        const videoId = videoData.get('videoId') || videoData.get('id');

        if (videoId) {
          await updateVideoMutation.mutateAsync({
            videoId: videoId.toString(),
            videoData
          });
        } else {
          const category = videoData.get('category');
          if (!category) {
            throw new Error('Please select a category for the new video');
          }
          await createVideoMutation.mutateAsync({
            category: category.toString(),
            videoData
          });
        }
      } else {
        if (!videoData.id) {
          throw new Error('Video ID is required for updates');
        }
        await updateVideoMutation.mutateAsync({
          videoId: videoData.id,
          videoData
        });
      }
    } catch (error) {
      console.error('Error saving video:', error);
      throw error;
    }
  };

  const handleDeleteVideo = (video: VideoForHook) => {
    deleteVideoMutation.mutate(video.id);
  };

  return {
    diplomasData,
    videosData,
    isLoadingDiplomas,
    isLoadingVideos,
    handleSaveVideo,
    handleDeleteVideo,
    fetchVideoById,
    isCreating: createVideoMutation.isPending,
    isUpdating: updateVideoMutation.isPending,
    isDeleting: deleteVideoMutation.isPending,
  };
}; 