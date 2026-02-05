import React from 'react';

// Material Entity Types
export interface Material {
  id: string;
  title: string;
  description: string;
  subject: string;
  course: string;
  semester: string;
  type: 'pdf';
  fileUrl: string;
  thumbnailUrl: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  isNewMaterial: boolean;
  isRestricted: boolean;
  uploadedBy: string;
  uploadedAt: string;
  views: number;
  downloads: number;
  rating: number;
  // Additional properties for form handling
  file?: File | string;
  size?: number;
  duration?: number;
}

// Material Form Types
export type MaterialFormData = {
  title: string;
  description: string;
  subject: string;
  course: string;
  semester: string;
  type: 'pdf';
  file?: File;
  thumbnail?: File;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  isNewMaterial: boolean;
  isRestricted: boolean;
};

export interface MaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Material>) => void;
  initialData?: Material | null;
  isEditing?: boolean;
}

// Material Details Types
export interface MaterialDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material;
  isLoading: boolean;
}

// Material Action Types
export interface MaterialAction {
  id: string;
  action: 'delete' | 'edit' | 'view' | 'toggle-restriction';
  data?: Partial<Material>;
}

export interface MaterialActionConfig {
  icon: React.ReactNode;
  label: string;
  onClick: (material: Material) => void;
  color: 'blue' | 'green' | 'red' | 'yellow';
  disabled?: boolean | ((material: Material) => boolean);
}

// Material Column Types
export interface MaterialColumn {
  header: string;
  key: string;
  render: (material: Material) => React.ReactNode;
  width?: string;
}

// Material Filter Types
export interface MaterialFilters {
  subject?: string;
  course?: string;
  semester?: string;
  type?: string;
  uploadedBy?: string;
  isRestricted?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

// Material Statistics Types
export interface MaterialStats {
  totalMaterials: number;
  restrictedMaterials: number;
  publicMaterials: number;
  totalViews: number;
  averageViews: number;
  pdfMaterials: number;
  videoMaterials: number;
  recentUploads: number;
}

// Material Upload Types
export interface MaterialUpload {
  id: string;
  materialId: string;
  fileName: string;
  fileSize: number;
  uploadProgress: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
}

// Material Permission Types
export interface MaterialPermission {
  materialId: string;
  userId: string;
  permission: 'view' | 'edit' | 'delete' | 'admin';
  grantedAt: string;
  grantedBy: string;
}

// Material Category Types
export interface MaterialCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  materialsCount: number;
  isActive: boolean;
}

// Material Tag Types
export interface MaterialTag {
  id: string;
  name: string;
  color: string;
  materialsCount: number;
}

// Material Search Types
export interface MaterialSearchParams {
  query: string;
  filters: MaterialFilters;
  sortBy?: 'title' | 'uploadedAt' | 'views' | 'subject';
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

// Material Response Types
export interface MaterialResponse {
  materials: Material[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Material Hook Types
export interface MaterialManagementState {
  materials: Material[];
  materialDetails: Material | null;
  isLoading: boolean;
  isLoadingMaterialDetails: boolean;
  error: Error | null;
  totalPages: number;
  page: number;
  filters: MaterialFilters;
  activeTab: 'all' | 'restricted';
}

export interface MaterialManagementActions {
  createMaterial: (data: MaterialFormData) => Promise<void>;
  updateMaterial: (params: { id: string; data: MaterialFormData }) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  toggleRestrictionMaterial: (params: { id: string; isRestricted: boolean }) => Promise<void>;
  handleViewMaterial: (id: string) => Promise<void>;
  handleEditMaterial: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: MaterialFilters) => void;
  handleTabChange: (tab: 'all' | 'restricted') => void;
} 