import { IMaterialsRepository } from '../../../application/materials/repositories/IMaterialsRepository';
import { MaterialModel } from '../../database/mongoose/material/MaterialModel';
import { Material } from '../../../domain/materials/entities/Material';
import { MaterialFilter, MaterialSortOptions } from '../../../domain/materials/entities/MaterialTypes';
import { MaterialMapper } from './MaterialMapper';
import { FilterQuery } from 'mongoose';
import { IMaterialSource } from './infraTypes';

export class MaterialsRepository implements IMaterialsRepository {
  async find(filter: MaterialFilter, options: { skip?: number; limit?: number; sort?: MaterialSortOptions } = {}): Promise<Material[]> {
    const mongoFilter = this._buildMongoFilter(filter);
    const docs = await MaterialModel.find(mongoFilter)
      .sort((options.sort as Record<string, 1 | -1>) ?? { uploadedAt: -1 })
      .skip(options.skip ?? 0)
      .limit(options.limit ?? 0)
      .lean() as unknown as IMaterialSource[];

    return docs.map(doc => MaterialMapper.toDomain(doc));
  }

  async count(filter: MaterialFilter): Promise<number> {
    const mongoFilter = this._buildMongoFilter(filter);
    return MaterialModel.countDocuments(mongoFilter);
  }

  async findById(id: string): Promise<Material | null> {
    const doc = await MaterialModel.findById(id).lean() as unknown as IMaterialSource;
    return doc ? MaterialMapper.toDomain(doc) : null;
  }

  async create(material: Material): Promise<Material> {
    const persistence = MaterialMapper.toPersistence(material);
    const doc = new MaterialModel(persistence);
    await doc.save();
    return MaterialMapper.toDomain(doc.toObject() as unknown as IMaterialSource);
  }

  async update(id: string, material: Material): Promise<Material> {
    const persistence = MaterialMapper.toPersistence(material);
    const doc = await MaterialModel.findByIdAndUpdate(id, persistence, { new: true }).lean() as unknown as IMaterialSource;
    if (!doc) throw new Error('Material not found');
    return MaterialMapper.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await MaterialModel.findByIdAndDelete(id);
  }

  async incrementViews(id: string): Promise<void> {
    await MaterialModel.findByIdAndUpdate(id, { $inc: { views: 1 } });
  }

  async incrementDownloads(id: string): Promise<void> {
    await MaterialModel.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
  }

  private _buildMongoFilter(filter: MaterialFilter): FilterQuery<IMaterialSource> {
    const mongoFilter: FilterQuery<IMaterialSource> = {};

    if (filter.subject) mongoFilter.subject = filter.subject;
    if (filter.course) mongoFilter.course = filter.course;
    if (filter.semester) mongoFilter.semester = filter.semester;
    if (filter.type) mongoFilter.type = filter.type;
    if (filter.difficulty) mongoFilter.difficulty = filter.difficulty;
    if (filter.isRestricted !== undefined) mongoFilter.isRestricted = filter.isRestricted;
    if (filter.uploadedBy) mongoFilter.uploadedBy = filter.uploadedBy;

    if (filter.startDate || filter.endDate) {
      const dateRange: Record<string, string | Date> = {};
      if (filter.startDate) dateRange.$gte = filter.startDate;
      if (filter.endDate) dateRange.$lte = filter.endDate;
      mongoFilter.uploadedAt = dateRange;
    }

    if (filter.search) {
      const searchRegex = new RegExp(filter.search, 'i');
      mongoFilter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { subject: searchRegex },
        { course: searchRegex },
        { tags: searchRegex }
      ];
    }

    return mongoFilter;
  }
}