export interface MaterialData {
    id: string;
    title: string;
    description: string;
    subject: string;
    course: string;
    semester: number;
    type: string;
    fileUrl: string;
    thumbnailUrl: string;
    tags: string[];
    difficulty: string;
    estimatedTime: string;
    isNew: boolean;
    isNewMaterial?: boolean;
    isRestricted: boolean;
    uploadedBy: string;
    uploadedAt: string;
    views: number;
    downloads: number;
    isBookmarked: boolean;
    isLiked: boolean;
}

export interface Material {
    props?: MaterialData;
    id: string;
    title: string;
    description: string;
    subject: string;
    course: string;
    semester: number;
    type: string;
    fileUrl: string;
    thumbnailUrl: string;
    tags: string[];
    difficulty: string;
    estimatedTime: string;
    isNew: boolean;
    isNewMaterial?: boolean;
    isRestricted: boolean;
    uploadedBy: string;
    uploadedAt: string;
    views: number;
    downloads: number;
    isBookmarked: boolean;
    isLiked: boolean;
}

export type ViewMode = 'grid' | 'table';
export type SortOption = 'newest' | 'oldest' | 'downloads' | 'views' | 'title';

export interface MaterialCardProps {
    material: Material;
    onDownload: (material: Material) => void;
    onBookmark: (materialId: string) => void;
    onLike: (materialId: string) => void;
    isBookmarked: boolean;
    isLiked: boolean;
}

export interface MaterialFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedCourse: string;
    setSelectedCourse: (course: string) => void;
    selectedType: string;
    setSelectedType: (type: string) => void;
    selectedSemester: string;
    setSelectedSemester: (semester: string) => void;
    selectedDifficulty: string;
    setSelectedDifficulty: (difficulty: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    materials: Material[];
}

export interface MaterialTableProps {
    materials: Material[];
    onDownload: (material: Material) => void;
    onBookmark: (materialId: string) => void;
    onLike: (materialId: string) => void;
}

export interface GetMaterialsFilters {
    subject?: string;
    course?: string;
    semester?: string;
    type?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

