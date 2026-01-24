import { NotificationProps, NotificationStatus, NotificationRecipientType } from "./NotificationTypes";
import { NotificationErrorType } from "../enums/NotificationErrorType";

export class Notification {
    public readonly id?: string;
    public readonly title: string;
    public readonly message: string;
    public readonly recipientType: NotificationRecipientType;
    public readonly recipientId?: string;
    public readonly recipientName?: string;
    public readonly createdBy: string;
    public readonly createdAt?: Date;
    public status: NotificationStatus;
    public readonly readBy: string[];

    constructor(props: NotificationProps) {
        this.id = props.id;
        this.title = props.title;
        this.message = props.message;
        this.recipientType = props.recipientType;
        this.recipientId = props.recipientId;
        this.recipientName = props.recipientName;
        this.createdBy = props.createdBy;
        this.createdAt = props.createdAt;
        this.status = props.status;
        this.readBy = props.readBy || [];
    }

    static create(props: NotificationProps): Notification {
        if (!props.title || !props.message || !props.recipientType || !props.createdBy) {
            throw new Error(NotificationErrorType.MissingRequiredFields);
        }
        if (!Object.values(NotificationRecipientType).includes(props.recipientType)) {
            throw new Error(NotificationErrorType.InvalidRecipientType);
        }
        if (props.recipientType === NotificationRecipientType.INDIVIDUAL && !props.recipientId) {
            throw new Error(NotificationErrorType.InvalidRecipientId);
        }
        return new Notification(props);
    }

    updateStatus(status: NotificationStatus): void {
        if (!Object.values(NotificationStatus).includes(status)) {
            throw new Error(NotificationErrorType.InvalidStatus);
        }
        this.status = status;
    }
}