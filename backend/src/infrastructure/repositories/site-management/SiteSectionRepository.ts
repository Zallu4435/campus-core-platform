import { SiteSectionModel } from '../../database/mongoose/site-management/SiteSectionModel';
import { ISiteSectionRepository } from '../../../application/site-management/repositories/ISiteSectionRepository';
import { SiteSectionFilter, ISiteSectionDocument, ISiteSection } from '../../../domain/site-management/entities/SiteSectionTypes';

export class SiteSectionRepository implements ISiteSectionRepository {
  async getSections(query: SiteSectionFilter): Promise<ISiteSectionDocument[]> {
    return SiteSectionModel.find(query).sort({ createdAt: -1 }).lean();
  }

  async getSectionById(id: string): Promise<ISiteSectionDocument | null> {
    return SiteSectionModel.findById(id).lean();
  }

  async createSection(params: Partial<ISiteSection>): Promise<ISiteSectionDocument> {
    const created = await SiteSectionModel.create(params);
    return created.toObject();
  }

  async updateSection(params: Partial<ISiteSection> & { id: string }): Promise<ISiteSectionDocument | null> {
    const { id, ...updateData } = params;
    return SiteSectionModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
  }

  async deleteSection(params: { id: string }): Promise<void> {
    await SiteSectionModel.findByIdAndDelete(params.id);
  }
}
