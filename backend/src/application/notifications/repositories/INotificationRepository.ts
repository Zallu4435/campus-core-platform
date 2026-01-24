import { Notification } from "../../../domain/notifications/entities/Notification";
import { NotificationRecipientType, NotificationStatus } from "../../../domain/notifications/entities/NotificationTypes";

export interface NotificationFilter {
    userId?: string;
    recipientId?: string;
    recipientType?: NotificationRecipientType | { $in: NotificationRecipientType[] };
    status?: string | NotificationStatus;
    readBy?: string | { $ne: string };
    createdAt?: { $gte?: Date; $lte?: Date };
    search?: string;
    $or?: any[];
}

export interface INotificationRepository {
    create(notification: Notification): Promise<Notification>;
    findById(id: string): Promise<Notification | null>;
    update(id: string, updates: Partial<Notification>): Promise<Notification | null>;
    delete(id: string): Promise<void>;
    find(filter: NotificationFilter, options?: { skip?: number; limit?: number; sort?: any }): Promise<Notification[]>;
    count(filter: NotificationFilter): Promise<number>;
    markAllAsRead(userId: string, filter: NotificationFilter): Promise<number>;
}