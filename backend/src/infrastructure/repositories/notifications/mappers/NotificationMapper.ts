import { Notification } from "../../../../domain/notifications/entities/Notification";
import { NotificationDoc } from "../../../database/mongoose/notification/notification.model";
import { NotificationResponseDTO } from "../../../../application/notifications/dtos/NotificationResponseDTOs";

export class NotificationMapper {
    static toDomain(mongooseDoc: NotificationDoc): Notification {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to domain entity");
        }

        return new Notification({
            id: mongooseDoc._id.toString(),
            title: mongooseDoc.title,
            message: mongooseDoc.message,
            recipientType: mongooseDoc.recipientType,
            recipientId: mongooseDoc.recipientId,
            recipientName: mongooseDoc.recipientName,
            createdBy: mongooseDoc.createdBy,
            createdAt: mongooseDoc.createdAt,
            status: mongooseDoc.status,
            readBy: mongooseDoc.readBy,
        });
    }

    static toPersistence(domainEntity: Notification): Record<string, unknown> {
        return {
            title: domainEntity.title,
            message: domainEntity.message,
            recipientType: domainEntity.recipientType,
            recipientId: domainEntity.recipientId,
            recipientName: domainEntity.recipientName,
            createdBy: domainEntity.createdBy,
            status: domainEntity.status,
            readBy: domainEntity.readBy,
        };
    }

    static toPersistenceUpdate(updates: Partial<Notification>): Record<string, unknown> {
        const data: Record<string, unknown> = {};
        if (updates.title) data.title = updates.title;
        if (updates.message) data.message = updates.message;
        if (updates.recipientType) data.recipientType = updates.recipientType;
        if (updates.recipientId) data.recipientId = updates.recipientId;
        if (updates.recipientName) data.recipientName = updates.recipientName;
        if (updates.createdBy) data.createdBy = updates.createdBy;
        if (updates.status) data.status = updates.status;
        if (updates.readBy) data.readBy = updates.readBy;
        return data;
    }

    static toResponseDTO(domainEntity: Notification, currentUserId?: string): NotificationResponseDTO {
        return {
            id: domainEntity.id || "",
            title: domainEntity.title,
            message: domainEntity.message,
            recipientType: domainEntity.recipientType,
            recipientId: domainEntity.recipientId,
            recipientName: domainEntity.recipientName,
            createdBy: domainEntity.createdBy,
            createdAt: domainEntity.createdAt ? domainEntity.createdAt.toISOString() : new Date().toISOString(),
            status: domainEntity.status,
            isRead: currentUserId ? domainEntity.readBy.includes(currentUserId) : false,
            readBy: domainEntity.readBy,
        };
    }

    static toResponseDTOList(entities: Notification[], currentUserId?: string): NotificationResponseDTO[] {
        return entities.map((entity) => this.toResponseDTO(entity, currentUserId));
    }
}
