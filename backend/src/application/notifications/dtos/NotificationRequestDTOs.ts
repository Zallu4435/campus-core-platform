import { NotificationRecipientType } from "../../../domain/notifications/entities/NotificationTypes";

export interface CreateNotificationRequestDTO {
    title: string;
    message: string;
    recipientType: NotificationRecipientType;
    recipientId?: string;
    recipientName?: string;
    createdBy: string;
}

export interface GetAllNotificationsRequestDTO {
    userId: string;
    collection: "register" | "admin" | "user" | "faculty";
    page: number;
    limit: number;
    recipientType?: string;
    status?: string;
    dateRange?: string;
    isRead?: boolean;
    search?: string;
}

export interface GetIndividualNotificationRequestDTO {
    notificationId: string;
}

export interface DeleteNotificationRequestDTO {
    notificationId: string;
    authenticatedUserId: string;
    collection: "register" | "admin" | "user" | "faculty";
}

export interface MarkNotificationAsReadRequestDTO {
    notificationId: string;
    authenticatedUserId: string;
    collection: "register" | "admin" | "user" | "faculty";
}

export interface MarkAllNotificationsAsReadRequestDTO {
    authenticatedUserId: string;
    collection: "register" | "admin" | "user" | "faculty";
}