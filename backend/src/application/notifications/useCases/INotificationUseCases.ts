import { Notification } from "../../../domain/notifications/entities/Notification";
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
    GetAllNotificationsResponseDTO,
    GetIndividualNotificationResponseDTO,
    DeleteNotificationResponseDTO,
    MarkNotificationAsReadResponseDTO,
    MarkAllNotificationsAsReadResponseDTO,
} from "../dtos/NotificationResponseDTOs";

export interface ICreateNotificationUseCase {
    execute(params: CreateNotificationRequestDTO): Promise<CreateNotificationResponseDTO>;
}

export interface IGetAllNotificationsUseCase {
    execute(params: GetAllNotificationsRequestDTO): Promise<{
        notifications: Notification[];
        totalPages: number;
        currentPage: number;
        totalItems: number;
    }>;
}

export interface IGetIndividualNotificationUseCase {
    execute(params: GetIndividualNotificationRequestDTO): Promise<{ notification: Notification }>;
}

export interface IDeleteNotificationUseCase {
    execute(params: DeleteNotificationRequestDTO): Promise<DeleteNotificationResponseDTO>;
}

export interface IMarkNotificationAsReadUseCase {
    execute(params: MarkNotificationAsReadRequestDTO): Promise<MarkNotificationAsReadResponseDTO>;
}

export interface IMarkAllNotificationsAsReadUseCase {
    execute(params: MarkAllNotificationsAsReadRequestDTO): Promise<MarkAllNotificationsAsReadResponseDTO>;
}
