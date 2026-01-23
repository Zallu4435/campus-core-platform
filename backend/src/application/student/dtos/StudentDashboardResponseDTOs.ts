import { Announcement, Deadline, ClassInfo, SpecialDate } from "../../../domain/student/entities/StudentDashboardTypes";

export interface ResponseDTO<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface GetDeadlinesResponseDTO extends ResponseDTO<Deadline[]> { }
export interface GetClassesResponseDTO extends ResponseDTO<ClassInfo[]> { }
export interface GetCalendarDaysResponseDTO extends ResponseDTO<Record<number, SpecialDate[]>> { }

export interface NewEventDTO {
    id: string;
    title: string;
    date: Date;
    location: string;
    description: string;
}

export interface GetUserInfoResponseDTO {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    course?: string;
    profilePicture?: string;
}
