import {
    CreateNotificationRequestDTO,
    GetAllNotificationsRequestDTO,
    GetIndividualNotificationRequestDTO,
    DeleteNotificationRequestDTO,
    MarkNotificationAsReadRequestDTO,
    MarkAllNotificationsAsReadRequestDTO,
} from "../dtos/NotificationRequestDTOs";
import {
    CreateNotificationResponseDTO,
    DeleteNotificationResponseDTO,
    MarkNotificationAsReadResponseDTO,
    MarkAllNotificationsAsReadResponseDTO,
} from "../dtos/NotificationResponseDTOs";
import { INotificationRepository, NotificationFilter } from "../repositories/INotificationRepository";
import { INotificationService } from "../services/INotificationService";
import { NotificationStatus, NotificationRecipientType } from "../../../domain/notifications/entities/NotificationTypes";
import { Notification } from "../../../domain/notifications/entities/Notification";
import {
    NotificationNotFoundError,
    NotificationCreationFailedError,
} from "../../../domain/notifications/errors/NotificationErrors";
import {
    ICreateNotificationUseCase,
    IGetAllNotificationsUseCase,
    IGetIndividualNotificationUseCase,
    IDeleteNotificationUseCase,
    IMarkNotificationAsReadUseCase,
    IMarkAllNotificationsAsReadUseCase
} from "./INotificationUseCases";

export class CreateNotificationUseCase implements ICreateNotificationUseCase {
    constructor(
        private _notificationRepository: INotificationRepository,
        private _notificationService: INotificationService
    ) { }

    async execute(params: CreateNotificationRequestDTO): Promise<CreateNotificationResponseDTO> {
        const notification = Notification.create({
            title: params.title,
            message: params.message,
            recipientType: params.recipientType,
            recipientId: params.recipientId,
            recipientName: params.recipientName,
            createdBy: params.createdBy,
            status: NotificationStatus.PENDING,
        });

        const created = await this._notificationRepository.create(notification);
        const notificationId = created.id!;

        try {
            const payload = {
                title: params.title,
                message: params.message,
                data: { notificationId }
            };

            await this._notificationService.sendByRecipientType(params.recipientType, params.recipientId, payload);

            await this._notificationRepository.update(notificationId, { status: NotificationStatus.SENT });
        } catch (error) {
            await this._notificationRepository.update(notificationId, { status: NotificationStatus.FAILED });
            throw error;
        }

        return { notificationId };
    }
}

export class GetAllNotificationsUseCase implements IGetAllNotificationsUseCase {
    constructor(private _notificationRepository: INotificationRepository) { }

    async execute(params: GetAllNotificationsRequestDTO): Promise<{ notifications: Notification[], totalPages: number, currentPage: number, totalItems: number }> {
        const { userId, collection, page = 1, limit = 10, recipientType, status, dateRange, isRead, search } = params;

        const filter: NotificationFilter = {};

        if (userId && collection !== "admin") {
            const validRecipientTypes = [
                NotificationRecipientType.ALL,
                NotificationRecipientType.ALL_STUDENTS,
                NotificationRecipientType.ALL_FACULTY,
                NotificationRecipientType.ALL_STUDENTS_AND_FACULTY
            ];
            filter.$or = [
                { recipientId: userId },
                { recipientType: { $in: validRecipientTypes } },
            ];
        }

        if (isRead !== undefined && userId) {
            if (isRead) {
                filter.readBy = userId;
            } else {
                filter.readBy = { $ne: userId };
            }
        }

        if (recipientType && recipientType !== "all") {
            filter.recipientType = recipientType as NotificationRecipientType;
        }

        if (status && status !== "All") {
            filter.status = status.toLowerCase();
        }

        if (dateRange && dateRange !== "All") {
            let start, end;
            if (["last_week", "last_month", "last_3_months", "last_6_months", "last_year"].includes(dateRange)) {
                const now = new Date();
                const startDate = new Date(now);
                switch (dateRange) {
                    case "last_week": startDate.setDate(now.getDate() - 7); break;
                    case "last_month": startDate.setMonth(now.getMonth() - 1); break;
                    case "last_3_months": startDate.setMonth(now.getMonth() - 3); break;
                    case "last_6_months": startDate.setMonth(now.getMonth() - 6); break;
                    case "last_year": startDate.setFullYear(now.getFullYear() - 1); break;
                }
                start = startDate.toISOString();
                end = now.toISOString();
            } else if (dateRange.includes(",")) {
                [start, end] = dateRange.split(",");
            }
            if (start && end) {
                filter.createdAt = { $gte: new Date(start), $lte: new Date(end) };
            }
        }

        if (search) {
            filter.search = search;
        }

        const skip = (page - 1) * limit;
        const sort = { createdAt: -1 };

        const notifications = await this._notificationRepository.find(filter, { skip, limit, sort });
        const totalItems = await this._notificationRepository.count(filter);
        const totalPages = Math.ceil(totalItems / limit);

        return {
            notifications,
            totalPages,
            currentPage: page,
            totalItems,
        };
    }
}

export class GetIndividualNotificationUseCase implements IGetIndividualNotificationUseCase {
    constructor(private _notificationRepository: INotificationRepository) { }

    async execute(params: GetIndividualNotificationRequestDTO): Promise<{ notification: Notification }> {
        const notification = await this._notificationRepository.findById(params.notificationId);
        if (!notification) {
            throw new NotificationNotFoundError(params.notificationId);
        }

        return { notification };
    }
}

export class DeleteNotificationUseCase implements IDeleteNotificationUseCase {
    constructor(private _notificationRepository: INotificationRepository) { }

    async execute(params: DeleteNotificationRequestDTO): Promise<DeleteNotificationResponseDTO> {
        const notification = await this._notificationRepository.findById(params.notificationId);
        if (!notification) {
            throw new NotificationNotFoundError(params.notificationId);
        }

        await this._notificationRepository.delete(params.notificationId);
        return { message: "Notification deleted successfully" };
    }
}

export class MarkNotificationAsReadUseCase implements IMarkNotificationAsReadUseCase {
    constructor(private _notificationRepository: INotificationRepository) { }

    async execute(params: MarkNotificationAsReadRequestDTO): Promise<MarkNotificationAsReadResponseDTO> {
        const notification = await this._notificationRepository.findById(params.notificationId);
        if (!notification) {
            throw new NotificationNotFoundError(params.notificationId);
        }

        if (!notification.readBy.includes(params.authenticatedUserId)) {
            await this._notificationRepository.update(params.notificationId, {
                readBy: [...notification.readBy, params.authenticatedUserId]
            });
        }

        return { success: true, message: "Notification marked as read" };
    }
}

export class MarkAllNotificationsAsReadUseCase implements IMarkAllNotificationsAsReadUseCase {
    constructor(private _notificationRepository: INotificationRepository) { }

    async execute(params: MarkAllNotificationsAsReadRequestDTO): Promise<MarkAllNotificationsAsReadResponseDTO> {
        const { authenticatedUserId, collection } = params;

        const filter: NotificationFilter = {};
        if (collection !== "admin") {
            const validRecipientTypes = [NotificationRecipientType.ALL, NotificationRecipientType.ALL_STUDENTS_AND_FACULTY];

            if (collection === "user") {
                validRecipientTypes.push(NotificationRecipientType.ALL_STUDENTS, NotificationRecipientType.INDIVIDUAL);
            } else if (collection === "faculty") {
                validRecipientTypes.push(NotificationRecipientType.ALL_FACULTY, NotificationRecipientType.INDIVIDUAL);
            }

            filter.$or = [
                { recipientType: NotificationRecipientType.INDIVIDUAL, recipientId: authenticatedUserId },
                { recipientType: { $in: validRecipientTypes } },
            ];
        }

        const updatedCount = await this._notificationRepository.markAllAsRead(authenticatedUserId, filter);

        return {
            success: true,
            message: "All notifications marked as read",
            updatedCount,
        };
    }
}