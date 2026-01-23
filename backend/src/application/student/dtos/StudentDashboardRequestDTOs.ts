export interface GetAnnouncementsRequestDTO {
    studentId: string;
}

export interface GetDeadlinesRequestDTO {
    studentId: string;
}

export interface GetClassesRequestDTO {
    studentId: string;
}

export interface GetCalendarDaysRequestDTO {
    studentId: string;
    month?: number;
    year?: number;
}

export interface GetUserInfoRequestDTO {
    studentId: string;
}

export interface GetNewEventsRequestDTO {
    studentId: string;
}
