import { Notification } from "../../../domain/notifications/entities/Notification";
import { NotificationFilter } from "./NotificationFilter";
export { NotificationFilter };



export interface INotificationRepository {
    create(notification: Notification): Promise<Notification>;
    findById(id: string): Promise<Notification | null>;
    update(id: string, updates: Partial<Notification>): Promise<Notification | null>;
    delete(id: string): Promise<void>;
    find(filter: NotificationFilter, options?: { skip?: number; limit?: number; sort?: Record<string, 1 | -1> }): Promise<Notification[]>;
    count(filter: NotificationFilter): Promise<number>;
    markAllAsRead(userId: string, filter: NotificationFilter): Promise<number>;
}