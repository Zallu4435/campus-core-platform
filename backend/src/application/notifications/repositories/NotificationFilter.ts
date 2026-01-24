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
