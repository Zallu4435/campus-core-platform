import { ISiteSection } from '../../../domain/site-management/entities/SiteSectionTypes';
import { SiteSectionFilter } from '../../../domain/site-management/entities/SiteSectionTypes';

export interface IUserSiteSectionRepository {
  findSectionsRaw(query: SiteSectionFilter, skip: number, limit: number): Promise<ISiteSection[]>;
  countSectionsRaw(query: SiteSectionFilter): Promise<number>;
  getDistinctCategories(sectionKey: string): Promise<string[]>;
} 