import { NotificationRecipientType, NotificationStatus } from "../../../domain/notifications/entities/NotificationTypes";

export interface NotificationResponseDTO {
    id: string;
    title: string;
    message: string;
    recipientType: NotificationRecipientType;
    recipientId?: string;
    recipientName?: string;
    createdBy: string;
    createdAt: string;
    status: NotificationStatus;
    isRead: boolean;
    readBy: string[];
}

export interface CreateNotificationResponseDTO {
    notificationId: string;
}

export interface GetAllNotificationsResponseDTO {
    notifications: NotificationResponseDTO[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
}

export interface GetIndividualNotificationResponseDTO {
    notification: NotificationResponseDTO;
}

export interface DeleteNotificationResponseDTO {
    message: string;
}

export interface MarkNotificationAsReadResponseDTO {
    success: boolean;
    message: string;
}

export interface MarkAllNotificationsAsReadResponseDTO {
    success: boolean;
    message: string;
    updatedCount: number;
}