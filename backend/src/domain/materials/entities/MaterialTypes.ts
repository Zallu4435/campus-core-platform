export enum MaterialType {
  PDF = "pdf",
  VIDEO = "video"
}

export enum MaterialDifficulty {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced"
}

export interface MaterialProps {
  id?: string;
  title: string;
  description: string;
  subject: string;
  course: string;
  semester: string;
  type: MaterialType;
  fileUrl: string;
  thumbnailUrl: string;
  tags: string[];
  difficulty: MaterialDifficulty;
  estimatedTime: string;
  isNewMaterial: boolean;
  isRestricted: boolean;
  uploadedBy: string;
  uploadedAt: string;
  views: number;
  downloads: number;
  updatedAt: string;
}

export type CreateMaterialProps = Omit<MaterialProps, 'id' | 'uploadedAt' | 'views' | 'downloads' | 'updatedAt'>;
export type UpdateMaterialProps = Partial<Omit<MaterialProps, 'uploadedAt' | 'views' | 'downloads' | 'updatedAt'>> & { id: string };

export interface MaterialFilter {
  subject?: string;
  course?: string;
  semester?: number | string;
  type?: MaterialType;
  difficulty?: MaterialDifficulty;
  isRestricted?: boolean;
  uploadedBy?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface UserMaterialFilter {
  subject?: string;
  course?: string;
  semester?: string | number;
  type?: string;
  difficulty?: string;
  search?: string;
  [key: string]: unknown;
}

export interface MaterialSortOptions {
  uploadedAt?: 1 | -1;
  updatedAt?: 1 | -1;
  downloads?: 1 | -1;
  views?: 1 | -1;
  title?: 1 | -1;
  [key: string]: 1 | -1 | undefined;
}
