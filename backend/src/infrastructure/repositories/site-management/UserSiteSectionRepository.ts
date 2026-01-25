import { SiteSectionModel } from '../../database/mongoose/site-management/SiteSectionModel';
import { IUserSiteSectionRepository } from '../../../application/site-management/repositories/IUserSiteSectionRepository';
import { SiteSectionFilter, ISiteSection } from '../../../domain/site-management/entities/SiteSectionTypes';
import { ISiteSectionSource } from './infraTypes';
import { SiteSectionMapper } from './mappers/SiteSectionMapper';

export class UserSiteSectionRepository implements IUserSiteSectionRepository {
  private buildQuery(filter: SiteSectionFilter): any {
    const query: any = {};

    if (filter.sectionKey) {
      query.sectionKey = filter.sectionKey;
    }

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.search) {
      const sanitizedSearch = filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '');
      const spaceFlexibleSearch = sanitizedSearch.split('').join('\\s*');
      const searchRegex = { $regex: spaceFlexibleSearch, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }

    return query;
  }

  async findSectionsRaw(filter: SiteSectionFilter, skip: number, limit: number): Promise<ISiteSection[]> {
    const query = this.buildQuery(filter);
    const docs = await SiteSectionModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean() as unknown as ISiteSectionSource[];
    return docs.map(doc => SiteSectionMapper.toDomain(doc));
  }

  async countSectionsRaw(filter: SiteSectionFilter): Promise<number> {
    const query = this.buildQuery(filter);
    return SiteSectionModel.countDocuments(query);
  }

  async getDistinctCategories(sectionKey: string): Promise<string[]> {
    const categories = await SiteSectionModel.distinct('category', { sectionKey });
    return categories.filter((c): c is string => typeof c === 'string' && c.trim() !== '');
  }
}