import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userMaterialService } from '../services/userMaterialService';
import { GetMaterialsFilters } from '../../../../../domain/types/canvas/materials';


export const useStudyMaterials = (filters: GetMaterialsFilters = {}) => {
  const queryClient = useQueryClient();

  const { data: materialsData, isLoading: isLoadingMaterials, error: materialsError } = useQuery({
    queryKey: ['materials', filters],
    queryFn: async () => {
      try {
        const response = await userMaterialService.getMaterials(filters);
        return response;
      } catch (error) {
        console.error('Error fetching materials:', error);
        throw error;
      }
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const response = await userMaterialService.toggleBookmark(materialId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const response = await userMaterialService.toggleLike(materialId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const blob = await userMaterialService.downloadMaterial(materialId);
      return { blob, materialId };
    },
    onSuccess: async ({ blob, materialId }) => {
      let fileName = 'material.pdf';
      try {
        const material = materialsData?.materials?.find((m: { id: string; _id?: string; title: string; fileUrl: string }) => (m.id === materialId || m._id === materialId));
        if (material) {
          const ext = material.fileUrl?.split('.').pop().split('?')[0] || 'pdf';
          fileName = (material.title || 'material').replace(/\s+/g, '_') + '.' + ext;
        }
      } catch { }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  return {
    materials: materialsData?.materials || [],
    totalPages: materialsData?.totalPages || 0,
    isLoading: isLoadingMaterials,
    error: materialsError,
    getMaterials: () => queryClient.invalidateQueries({ queryKey: ['materials'] }),
    downloadMaterial: (materialId: string) => downloadMutation.mutate(materialId),
    toggleBookmark: (materialId: string) => bookmarkMutation.mutate(materialId),
    toggleLike: (materialId: string) => likeMutation.mutate(materialId),
    isDownloading: downloadMutation.isPending,
  };
}; 