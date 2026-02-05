import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialService } from '../services/materialService';
import { Material } from '../../domain/types/management/materialmanagement';
import { toast } from 'react-hot-toast';

export const useMaterialManagement = (
  page: number = 1,
  itemsPerPage: number = 10,
  filters: {
    subject: string;
    course: string;
    semester: string;
    status: string;
    dateRange: string;
    startDate?: string;
    endDate?: string;
  },
  searchQuery: string = ''
) => {
  const queryClient = useQueryClient();
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  const { data: materialsData, isLoading, error } = useQuery<{ materials: Material[]; totalPages: number }, Error>({
    queryKey: ['materials', page, filters, searchQuery],
    queryFn: () => materialService.getMaterials(
      {
        ...filters,
        search: searchQuery,
      },
      page,
      itemsPerPage
    ),
  });

  const createMaterialMutation = useMutation({
    mutationFn: (data: Omit<Material, '_id' | 'uploadedAt' | 'views' | 'downloads' | 'rating'>) =>
      materialService.createMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create material');
    },
  });

  const updateMaterialMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Material> }) =>
      materialService.updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update material');
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (id: string) => materialService.deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete material');
    },
  });

  const toggleRestrictionMutation = useMutation({
    mutationFn: ({ id, isRestricted }: { id: string; isRestricted: boolean }) =>
      materialService.toggleRestriction(id, isRestricted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Material restriction updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update restriction');
    },
  });

  const { data: materialDetails, isLoading: isLoadingMaterialDetails } = useQuery<Material, Error>({
    queryKey: ['materialDetails', selectedMaterialId],
    queryFn: () => materialService.getMaterialById(selectedMaterialId || ''),
    enabled: !!selectedMaterialId,
  });

  const handleViewMaterial = useCallback((id: string) => {
    setSelectedMaterialId(id);
  }, []);

  const handleEditMaterial = useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['materialDetails', id],
      queryFn: () => materialService.getMaterialById(id),
    });
  }, [queryClient]);

  return {
    materials: materialsData?.materials || [],
    totalPages: Number(materialsData?.totalPages) || 1,
    isLoading,
    error,
    createMaterial: createMaterialMutation.mutateAsync,
    updateMaterial: updateMaterialMutation.mutateAsync,
    deleteMaterial: deleteMaterialMutation.mutateAsync,
    toggleRestrictionMaterial: toggleRestrictionMutation.mutateAsync,
    materialDetails,
    isLoadingMaterialDetails,
    handleViewMaterial,
    handleEditMaterial,
  };
};