import { SiteSectionKey, ISiteSection, IHighlightSection, IVagoNowSection, ILeadershipSection } from '../entities/SiteSectionTypes';

// Request DTOs
export interface GetSiteSectionsRequestDTO {
  sectionKey?: SiteSectionKey;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface GetSiteSectionByIdRequestDTO {
  id: string;
}

export type CreateSiteSectionRequestDTO = IHighlightSection | IVagoNowSection | ILeadershipSection;

export interface UpdateSiteSectionRequestDTO {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  bio?: string;
  image?: string;
  photo?: string;
  link?: string;
  position?: string;
  category?: string;
}

export interface DeleteSiteSectionRequestDTO {
  id: string;
}

// Response DTOs
export type SiteSectionDTO = ISiteSection;

export interface GetSiteSectionsResponseDTO {
  sections: SiteSectionDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetSiteSectionByIdResponseDTO {
  section: SiteSectionDTO;
}

export interface CreateSiteSectionResponseDTO {
  section: SiteSectionDTO;
}

export interface UpdateSiteSectionResponseDTO {
  section: SiteSectionDTO;
}

export interface SiteSectionFilterDTO {
  sectionType?: 'highlights' | 'vagoNow' | 'leadership';
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}