import { CreateSiteSectionRequest, UpdateSiteSectionRequest, DeleteSiteSectionRequest, SiteSectionFilter, ISiteSection } from "../../../domain/site-management/entities/SiteSectionTypes";

export interface ISiteSectionRepository {
  getSections(query: SiteSectionFilter): Promise<ISiteSection[]>;
  getSectionById(id: string): Promise<ISiteSection | null>;
  createSection(params: CreateSiteSectionRequest): Promise<ISiteSection>;
  updateSection(params: UpdateSiteSectionRequest): Promise<ISiteSection | null>;
  deleteSection(params: DeleteSiteSectionRequest): Promise<void>;
}