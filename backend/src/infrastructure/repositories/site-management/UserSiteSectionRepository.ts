import { SiteSectionModel } from '../../database/mongoose/site-management/SiteSectionModel';
import { IUserSiteSectionRepository } from '../../../application/site-management/repositories/IUserSiteSectionRepository';
import { SiteSectionFilter, ISiteSectionDocument } from '../../../domain/site-management/entities/SiteSectionTypes';

export class UserSiteSectionRepository implements IUserSiteSectionRepository {
  async findSectionsRaw(query: SiteSectionFilter, skip: number, limit: number): Promise<ISiteSectionDocument[]> {
    return SiteSectionModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean();
  }

  async countSectionsRaw(query: SiteSectionFilter): Promise<number> {
    return SiteSectionModel.countDocuments(query);
  }
}