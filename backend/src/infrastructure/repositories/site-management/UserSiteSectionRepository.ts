import { SiteSectionModel } from '../../database/mongoose/site-management/SiteSectionModel';
import { IUserSiteSectionRepository } from '../../../application/site-management/repositories/IUserSiteSectionRepository';
import { SiteSectionFilter, ISiteSection } from '../../../domain/site-management/entities/SiteSectionTypes';
import { ISiteSectionSource } from './infraTypes';
import { SiteSectionMapper } from './mappers/SiteSectionMapper';

export class UserSiteSectionRepository implements IUserSiteSectionRepository {
  async findSectionsRaw(query: SiteSectionFilter, skip: number, limit: number): Promise<ISiteSection[]> {
    const docs = await SiteSectionModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean() as unknown as ISiteSectionSource[];
    return docs.map(doc => SiteSectionMapper.toDomain(doc));
  }

  async countSectionsRaw(query: SiteSectionFilter): Promise<number> {
    return SiteSectionModel.countDocuments(query);
  }
}