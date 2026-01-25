import { NotificationModel, NotificationDoc } from "../../database/mongoose/notification/notification.model";
import { INotificationRepository, NotificationFilter } from "../../../application/notifications/repositories/INotificationRepository";
import { Notification } from "../../../domain/notifications/entities/Notification";
import { NotificationMapper } from "./mappers/NotificationMapper";

export class NotificationRepository implements INotificationRepository {
    async create(notification: Notification): Promise<Notification> {
        const persistenceData = NotificationMapper.toPersistence(notification);
        const doc = await NotificationModel.create(persistenceData);
        return NotificationMapper.toDomain(doc);
    }

    async findById(id: string): Promise<Notification | null> {
        const doc = await NotificationModel.findById(id).lean() as NotificationDoc | null;
        return doc ? NotificationMapper.toDomain(doc) : null;
    }

    async update(id: string, updates: Partial<Notification>): Promise<Notification | null> {
        const persistenceData = NotificationMapper.toPersistenceUpdate(updates);
        const doc = await NotificationModel.findByIdAndUpdate(id, persistenceData, { new: true }).lean() as NotificationDoc | null;
        return doc ? NotificationMapper.toDomain(doc) : null;
    }

    async delete(id: string): Promise<void> {
        await NotificationModel.findByIdAndDelete(id);
    }

    async find(filter: NotificationFilter, options: { skip?: number; limit?: number; sort?: Record<string, any> | string } = {}): Promise<Notification[]> {
        const { skip = 0, limit = 0, sort = { createdAt: -1 } } = options;

        let queryFilter: Record<string, unknown> = { ...filter };
        if (queryFilter.search) {
            const searchRegex = new RegExp(queryFilter.search as string, 'i');
            queryFilter.$or = [
                { title: searchRegex },
                { message: searchRegex }
            ];
            delete queryFilter.search;
        }

        const docs = await NotificationModel.find(queryFilter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean() as NotificationDoc[];

        return docs.map(doc => NotificationMapper.toDomain(doc));
    }

    async count(filter: NotificationFilter): Promise<number> {
        let queryFilter: Record<string, unknown> = { ...filter };
        if (queryFilter.search) {
            const searchRegex = new RegExp(queryFilter.search as string, 'i');
            queryFilter.$or = [
                { title: searchRegex },
                { message: searchRegex }
            ];
            delete queryFilter.search;
        }
        return await NotificationModel.countDocuments(queryFilter);
    }

    async markAllAsRead(userId: string, filter: NotificationFilter): Promise<number> {
        const query: Record<string, unknown> = { ...filter, readBy: { $ne: userId } };
        const result = await NotificationModel.updateMany(
            query,
            { $push: { readBy: userId } }
        );
        return result.modifiedCount;
    }
}