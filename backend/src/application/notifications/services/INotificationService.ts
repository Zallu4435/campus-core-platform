import { NotificationRecipientType } from "../../../domain/notifications/entities/NotificationTypes";

export interface NotificationPayload {
    title: string;
    message: string;
    data?: Record<string, string>;
}

export interface INotificationService {
    sendToUser(userId: string, payload: NotificationPayload): Promise<void>;
    sendToTopic(topic: string, payload: NotificationPayload): Promise<void>;
    sendToToken(token: string, payload: NotificationPayload): Promise<void>;
    sendBulk(tokens: string[], payload: NotificationPayload): Promise<void>;

    sendToAllStudents(payload: NotificationPayload): Promise<void>;
    sendToAllFaculty(payload: NotificationPayload): Promise<void>;
    sendToAll(payload: NotificationPayload): Promise<void>;
    sendByRecipientType(recipientType: NotificationRecipientType, recipientId: string | undefined, payload: NotificationPayload): Promise<void>;
}
