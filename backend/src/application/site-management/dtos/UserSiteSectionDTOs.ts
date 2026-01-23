import { SiteSectionKey } from '../entities/SiteSectionTypes';

// Request DTOs for user-side
export interface GetUserSiteSectionsRequestDTO {
  sectionKey: SiteSectionKey;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

// Response DTOs for user-side
export interface UserSiteSectionDTO {
  id: string;
  sectionKey: SiteSectionKey;
  title: string;
  description: string;
  image: string;
  link: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUserSiteSectionsResponseDTO {
  sections: UserSiteSectionDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 