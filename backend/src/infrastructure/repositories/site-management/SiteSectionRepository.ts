import { SiteSectionModel } from '../../database/mongoose/site-management/SiteSectionModel';
import { ISiteSectionRepository } from '../../../application/site-management/repositories/ISiteSectionRepository';
import { SiteSectionFilter, ISiteSection, CreateSiteSectionRequest, UpdateSiteSectionRequest } from '../../../domain/site-management/entities/SiteSectionTypes';
import { SiteSectionMapper } from './mappers/SiteSectionMapper';
import { FilterQuery } from 'mongoose';

import { ISiteSectionSource } from './infraTypes';

export class SiteSectionRepository implements ISiteSectionRepository {
  async getSections(filter: SiteSectionFilter): Promise<ISiteSection[]> {
    const query: Record<string, unknown> = {};

    if (filter.sectionKey) {
      query.sectionKey = filter.sectionKey;
    }

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive;
    }

    if (filter.id) {
      query._id = filter.id;
    }

    if (filter.search) {
      const searchRegex = { $regex: filter.search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }

    if (filter.startDate || filter.endDate) {
      const dateQuery: Record<string, unknown> = {};
      if (filter.startDate) dateQuery.$gte = filter.startDate;
      if (filter.endDate) dateQuery.$lte = filter.endDate;
      query.createdAt = dateQuery;
    }

    const docs = await SiteSectionModel.find(query).sort({ createdAt: -1 }).lean() as unknown as ISiteSectionSource[];
    return docs.map(doc => SiteSectionMapper.toDomain(doc));
  }

  async getSectionById(id: string): Promise<ISiteSection | null> {
    const doc = await SiteSectionModel.findById(id).lean() as unknown as ISiteSectionSource;
    return doc ? SiteSectionMapper.toDomain(doc) : null;
  }

  async createSection(params: CreateSiteSectionRequest): Promise<ISiteSection> {
    const created = await SiteSectionModel.create(params);
    return SiteSectionMapper.toDomain(created.toObject ? created.toObject() as unknown as ISiteSectionSource : created as unknown as ISiteSectionSource);
  }

  async updateSection(params: UpdateSiteSectionRequest): Promise<ISiteSection | null> {
    const { id, ...updateData } = params;
    const updated = await SiteSectionModel.findByIdAndUpdate(id, updateData, { new: true }).lean() as unknown as ISiteSectionSource;
    return updated ? SiteSectionMapper.toDomain(updated) : null;
  }

  async deleteSection(params: { id: string }): Promise<void> {
    await SiteSectionModel.findByIdAndDelete(params.id);
  }
}
