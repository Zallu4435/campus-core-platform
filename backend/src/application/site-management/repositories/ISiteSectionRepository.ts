import {
  CreateSiteSectionRequest,
  UpdateSiteSectionRequest,
  DeleteSiteSectionRequest,
  ISiteSectionDocument
} from '../../../domain/site-management/entities/SiteSectionTypes';

export interface ISiteSectionRepository {
  getSections(query): Promise<ISiteSectionDocument[]>;
  getSectionById(id: string): Promise<ISiteSectionDocument | null>;
  createSection(params: CreateSiteSectionRequest): Promise<ISiteSectionDocument>;
  updateSection(params: UpdateSiteSectionRequest): Promise<ISiteSectionDocument | null>;
  deleteSection(params: DeleteSiteSectionRequest): Promise<void>;
}