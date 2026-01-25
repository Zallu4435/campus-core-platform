export interface INotificationService {
    sendApprovalNotification(data: {
        entityType: string;
        requestId: string;
        userId: string;
        entityTitle: string;
    }): Promise<void>;

    sendRejectionNotification(data: {
        entityType: string;
        requestId: string;
        userId: string;
        entityTitle: string;
    }): Promise<void>;
}
