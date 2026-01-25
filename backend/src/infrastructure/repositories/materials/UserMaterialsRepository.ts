import { IUserMaterialsRepository } from '../../../application/materials/repositories/IUserMaterialsRepository';
import { MaterialModel } from '../../database/mongoose/material/MaterialModel';
import { Material } from '../../../domain/materials/entities/Material';
import { UserMaterialFilter, MaterialSortOptions } from '../../../domain/materials/entities/MaterialTypes';
import { MaterialMapper } from './MaterialMapper';
import { FilterQuery } from 'mongoose';
import { IMaterialSource } from './infraTypes';

export class UserMaterialsRepository implements IUserMaterialsRepository {
  async find(filter: UserMaterialFilter, options: { skip?: number; limit?: number; sort?: MaterialSortOptions } = {}): Promise<Material[]> {
    const mongoFilter = this._buildMongoFilter(filter);
    const docs = await MaterialModel.find(mongoFilter)
      .sort(options.sort as any ?? { uploadedAt: -1 })
      .skip(options.skip ?? 0)
      .limit(options.limit ?? 0)
      .lean() as unknown as IMaterialSource[];

    return docs.map(doc => MaterialMapper.toDomain(doc));
  }

  async count(filter: UserMaterialFilter): Promise<number> {
    const mongoFilter = this._buildMongoFilter(filter);
    return MaterialModel.countDocuments(mongoFilter);
  }

  async findById(id: string): Promise<Material | null> {
    const doc = await MaterialModel.findById(id).lean() as unknown as IMaterialSource;
    return doc ? MaterialMapper.toDomain(doc) : null;
  }

  async update(id: string, material: Material): Promise<Material | null> {
    const persistence = MaterialMapper.toPersistence(material);
    const doc = await MaterialModel.findByIdAndUpdate(id, persistence, { new: true }).lean() as unknown as IMaterialSource;
    return doc ? MaterialMapper.toDomain(doc) : null;
  }

  async toggleBookmark(materialId: string, userId: string): Promise<void> {
    const material = await MaterialModel.findById(materialId);
    if (!material) throw new Error('Material not found');

    const bookmarkIndex = material.bookmarks.findIndex((b: { userId: string }) => b.userId === userId);
    if (bookmarkIndex > -1) {
      material.bookmarks.splice(bookmarkIndex, 1);
    } else {
      material.bookmarks.push({ userId });
    }
    await material.save();
  }

  async toggleLike(materialId: string, userId: string): Promise<void> {
    const material = await MaterialModel.findById(materialId);
    if (!material) throw new Error('Material not found');

    const likeIndex = material.likes.findIndex((l: { userId: string }) => l.userId === userId);
    if (likeIndex > -1) {
      material.likes.splice(likeIndex, 1);
    } else {
      material.likes.push({ userId });
    }
    await material.save();
  }

  async isBookmarked(userId: string, materialId: string): Promise<boolean> {
    const doc = await MaterialModel.findOne({ _id: materialId, 'bookmarks.userId': userId });
    return !!doc;
  }

  async isLiked(userId: string, materialId: string): Promise<boolean> {
    const doc = await MaterialModel.findOne({ _id: materialId, 'likes.userId': userId });
    return !!doc;
  }

  async incrementDownloads(materialId: string): Promise<void> {
    await MaterialModel.findByIdAndUpdate(materialId, { $inc: { downloads: 1 } });
  }

  private _buildMongoFilter(filter: UserMaterialFilter): FilterQuery<IMaterialSource> {
    const mongoFilter: FilterQuery<IMaterialSource> = {};

    if (filter.subject) mongoFilter.subject = { $regex: filter.subject, $options: 'i' };
    if (filter.course) mongoFilter.course = filter.course;
    if (filter.semester) mongoFilter.semester = filter.semester;
    if (filter.type) mongoFilter.type = filter.type;
    if (filter.difficulty) mongoFilter.difficulty = filter.difficulty;

    if (filter.search) {
      const searchRegex = new RegExp(filter.search, 'i');
      mongoFilter.$or = [
        { title: searchRegex },
        { subject: searchRegex },
        { uploadedBy: searchRegex },
        { course: searchRegex }
      ];
    }

    return mongoFilter;
  }
}