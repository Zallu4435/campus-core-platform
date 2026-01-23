import {
    GetAnnouncementsRequestDTO,
    GetDeadlinesRequestDTO,
    GetClassesRequestDTO,
    GetCalendarDaysRequestDTO,
    GetUserInfoRequestDTO,
    GetNewEventsRequestDTO
} from "../dtos/StudentDashboardRequestDTOs";
import {
    NewEventDTO,
    GetUserInfoResponseDTO
} from "../dtos/StudentDashboardResponseDTOs";
import { Announcement, Deadline, ClassInfo, SpecialDate } from "../../../domain/student/entities/StudentDashboardTypes";

export interface IGetAnnouncementsUseCase {
    execute(params: GetAnnouncementsRequestDTO): Promise<Announcement[]>;
}

export interface IGetDeadlinesUseCase {
    execute(params: GetDeadlinesRequestDTO): Promise<Deadline[]>;
}

export interface IGetClassesUseCase {
    execute(params: GetClassesRequestDTO): Promise<ClassInfo[]>;
}

export interface IGetCalendarDaysUseCase {
    execute(params: GetCalendarDaysRequestDTO): Promise<Record<number, SpecialDate[]>>;
}

export interface IGetNewEventsUseCase {
    execute(params: GetNewEventsRequestDTO): Promise<NewEventDTO[]>;
}

export interface IGetUserInfoForDashboardUseCase {
    execute(params: GetUserInfoRequestDTO): Promise<GetUserInfoResponseDTO>;
}