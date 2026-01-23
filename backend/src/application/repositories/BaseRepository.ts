import { FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseRepository } from '../../application/repositories/IBaseRepository';
import { NotificationModel } from '../../infrastructure/database/mongoose/notification/notification.model';

export abstract class BaseRepository<
  TSchema,
  CreateDto = unknown,
  UpdateDto = unknown,
  FilterDto = Record<string, unknown>,
  ResponseType = TSchema
> implements IBaseRepository<ResponseType, CreateDto, UpdateDto, FilterDto, ResponseType> {

  constructor(protected model: any) { }

  async create(data: CreateDto): Promise<ResponseType> {
    const entity = new this.model(data);
    return await entity.save() as ResponseType;
  }

  async getById(id: string): Promise<ResponseType | null> {
    return this.model.findById(id).lean().exec() as Promise<ResponseType | null>;
  }

  async find(filter: FilterDto, page = 1, limit = 10): Promise<{
    data: ResponseType[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(filter as FilterQuery<TSchema>).skip(skip).limit(limit).lean().exec(),
      this.model.countDocuments(filter as FilterQuery<TSchema>)
    ]);

    return { data: data as ResponseType[], total, page, limit };
  }

  async findOne(filter: FilterDto): Promise<ResponseType | null> {
    return this.model.findOne(filter as FilterQuery<TSchema>).lean().exec() as Promise<ResponseType | null>;
  }

  async updateById(id: string, data: UpdateDto): Promise<ResponseType | null> {
    return this.model.findByIdAndUpdate(
      id,
      data as UpdateQuery<TSchema>,
      { new: true, runValidators: true }
    ).lean().exec() as Promise<ResponseType | null>;
  }

  async deleteById(id: string): Promise<ResponseType | null> {
    return this.model.findByIdAndDelete(id).lean().exec() as Promise<ResponseType | null>;
  }

  async count(filter?: FilterDto): Promise<number> {
    return this.model.countDocuments((filter as FilterQuery<TSchema>) || {}).exec();
  }

  async exists(filter: FilterDto): Promise<boolean> {
    const count = await this.model.countDocuments(filter as FilterQuery<TSchema>);
    return count > 0;
  }

  // Generic notification methods for entity requests
  async sendRequestApprovalNotification(entityType: string, requestId: string, userId: string, entityTitle: string): Promise<void> {
    try {
      const notification = new NotificationModel({
        title: `Your ${entityType} request has been approved!`,
        message: `Your ${entityType} request for "${entityTitle}" has been approved.`,
        recipientType: 'individual',
        recipientId: userId,
        recipientName: `User ${userId}`,
        createdBy: 'system',
        createdAt: new Date(),
        status: 'sent',
        readBy: [],
      });

      await notification.save();
    } catch (error) {
      console.error(`Failed to send approval notification for ${entityType} request ${requestId}:`, error);
    }
  }

  async sendRequestRejectionNotification(entityType: string, requestId: string, userId: string, entityTitle: string): Promise<void> {
    try {
      const notification = new NotificationModel({
        title: `Your ${entityType} request has been rejected.`,
        message: `Your ${entityType} request for "${entityTitle}" has been rejected.`,
        recipientType: 'individual',
        recipientId: userId,
        recipientName: `User ${userId}`,
        createdBy: 'system',
        createdAt: new Date(),
        status: 'sent',
        readBy: [],
      });

      await notification.save();
    } catch (error) {
      console.error(`Failed to send rejection notification for ${entityType} request ${requestId}:`, error);
    }
  }
}
