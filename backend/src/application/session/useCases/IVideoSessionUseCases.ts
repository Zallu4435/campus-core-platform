import {
    CreateVideoSessionRequestDTO,
    JoinVideoSessionRequestDTO,
    UpdateVideoSessionRequestDTO,
    DeleteVideoSessionRequestDTO,
    GetSessionAttendanceRequestDTO
} from '../dtos/VideoSessionRequestDTOs';
import {
    CreateVideoSessionResponseDTO,
    JoinVideoSessionResponseDTO,
    VideoSessionResponseDTO,
    UpdateVideoSessionResponseDTO,
    UpdateVideoSessionStatusResponseDTO,
    DeleteVideoSessionResponseDTO,
    SessionListResponseDTO,
    AttendanceRecordResponseDTO
} from '../dtos/VideoSessionResponseDTOs';
import { VideoSessionStatus } from '../../../domain/session/enums/VideoSessionStatus';

export interface ICreateVideoSessionUseCase {
    execute(params: CreateVideoSessionRequestDTO): Promise<CreateVideoSessionResponseDTO>;
}

export interface IJoinVideoSessionUseCase {
    execute(params: JoinVideoSessionRequestDTO): Promise<JoinVideoSessionResponseDTO>;
}

export interface IGetVideoSessionUseCase {
    execute(sessionId: string): Promise<VideoSessionResponseDTO | null>;
}

export interface IUpdateVideoSessionUseCase {
    execute(params: UpdateVideoSessionRequestDTO): Promise<UpdateVideoSessionResponseDTO | null>;
}

export interface IDeleteVideoSessionUseCase {
    execute(params: DeleteVideoSessionRequestDTO): Promise<DeleteVideoSessionResponseDTO>;
}

export interface IGetAllVideoSessionsUseCase {
    execute(params: { search?: string; status?: string; instructor?: string; course?: string }): Promise<SessionListResponseDTO[]>;
}

export interface IGetUserSessionsUseCase {
    execute(params: { search?: string; status?: string; instructor?: string; course?: string; userId?: string }): Promise<{ sessions: SessionListResponseDTO[], watchedCount: number }>;
}

export interface IUpdateVideoSessionStatusUseCase {
    execute(sessionId: string, status: VideoSessionStatus): Promise<UpdateVideoSessionStatusResponseDTO | null>;
}

export interface IGetSessionAttendanceUseCase {
    execute(sessionId: string, filters: GetSessionAttendanceRequestDTO): Promise<AttendanceRecordResponseDTO[]>;
}

export interface IUpdateAttendanceStatusUseCase {
    execute(sessionId: string, userId: string, status: string, name: string): Promise<void>;
}

export interface IRecordAttendanceJoinUseCase {
    execute(sessionId: string, userId: string): Promise<void>;
}

export interface IRecordAttendanceLeaveUseCase {
    execute(sessionId: string, userId: string): Promise<void>;
}
