import { ISessionRepository } from '../repositories/ISessionRepository';
import { IAuthRepository } from '../../auth/repositories/IAuthRepository';
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
import { VideoSession } from '../../../domain/session/entities/VideoSession';
import { VideoSessionStatus } from '../../../domain/session/enums/VideoSessionStatus';
import { config } from '../../../config/config';
import {
    ICreateVideoSessionUseCase,
    IJoinVideoSessionUseCase,
    IGetVideoSessionUseCase,
    IUpdateVideoSessionUseCase,
    IDeleteVideoSessionUseCase,
    IGetAllVideoSessionsUseCase,
    IGetUserSessionsUseCase,
    IUpdateVideoSessionStatusUseCase,
    IGetSessionAttendanceUseCase,
    IUpdateAttendanceStatusUseCase,
    IRecordAttendanceJoinUseCase,
    IRecordAttendanceLeaveUseCase
} from './IVideoSessionUseCases';
import { AttendanceRecord } from '../../../domain/session/entities/VideoSessionTypes';
import { VideoSessionMapper } from '../../../infrastructure/repositories/session/mappers/VideoSessionMapper';

export class CreateVideoSessionUseCase implements ICreateVideoSessionUseCase {
    constructor(private _sessionRepository: ISessionRepository) { }
    async execute(params: CreateVideoSessionRequestDTO): Promise<CreateVideoSessionResponseDTO> {
        let startTime: Date;
        if (params.date && params.time) {
            startTime = new Date(`${params.date}T${params.time}:00.000Z`);
        } else if (params.startTime) {
            startTime = new Date(params.startTime);
        } else {
            throw new Error('startTime or (date and time) must be provided');
        }

        if (!params.hostId) {
            throw new Error('hostId is required');
        }

        const sessionData: Partial<VideoSession> = {
            title: params.title,
            hostId: params.hostId,
            participants: [params.hostId],
            startTime: startTime,
            endTime: null,
            status: VideoSessionStatus.Scheduled,
            description: params.description,
            instructor: params.instructor,
            course: params.course,
            duration: params.duration,
            maxAttendees: params.maxAttendees,
            tags: params.tags,
            difficulty: params.difficulty,
            isLive: params.isLive,
            hasRecording: params.hasRecording,
            recordingUrl: params.recordingUrl,
            attendees: params.attendees,
            attendeeList: params.attendeeList
        };

        const created = await this._sessionRepository.create(sessionData);
        return { session: VideoSessionMapper.toResponseDTO(created) };
    }
}

export class JoinVideoSessionUseCase implements IJoinVideoSessionUseCase {
    constructor(private _sessionRepository: ISessionRepository) { }
    async execute(params: JoinVideoSessionRequestDTO): Promise<JoinVideoSessionResponseDTO> {
        const session = await this._sessionRepository.getById(params.sessionId);
        if (!session) {
            throw new Error('Session not found');
        }

        if (session.status === VideoSessionStatus.Ended || session.status === VideoSessionStatus.Cancelled) {
            throw new Error('Cannot join session: Session has ended or been cancelled');
        }

        if (session.status !== VideoSessionStatus.Ongoing) {
            throw new Error('Cannot join session: Session is not live');
        }

        const joinedSession = await this._sessionRepository.join(params.sessionId, params.participantId);
        return { session: VideoSessionMapper.toResponseDTO(joinedSession) };
    }
}

export class GetVideoSessionUseCase implements IGetVideoSessionUseCase {
    constructor(private _sessionRepository: ISessionRepository) { }
    async execute(sessionId: string): Promise<VideoSessionResponseDTO | null> {
        const session = await this._sessionRepository.getById(sessionId);
        return session ? VideoSessionMapper.toResponseDTO(session) : null;
    }
}

export class UpdateVideoSessionUseCase implements IUpdateVideoSessionUseCase {
    constructor(private _sessionRepository: ISessionRepository) { }
    async execute(params: UpdateVideoSessionRequestDTO): Promise<UpdateVideoSessionResponseDTO | null> {
        const updateData: Record<string, unknown> = { ...params.data };

        if (updateData.status && typeof updateData.status === 'string') {
            if (Object.values(VideoSessionStatus).includes(updateData.status as VideoSessionStatus)) {
                // leave as is
            } else {
                updateData.status = VideoSessionStatus[updateData.status as keyof typeof VideoSessionStatus] || undefined;
            }
        }
        if (updateData.date && updateData.time) {
            updateData.startTime = new Date(`${updateData.date}T${updateData.time}:00.000Z`);
            delete updateData.date;
            delete updateData.time;
        } else if (updateData.startTime && typeof updateData.startTime === 'string') {
            updateData.startTime = new Date(updateData.startTime);
        }
        if (updateData.endTime && typeof updateData.endTime === 'string') {
            updateData.endTime = new Date(updateData.endTime);
        }
        const session = await this._sessionRepository.update(params.sessionId, updateData as Partial<VideoSession>);
        return session ? { session: VideoSessionMapper.toResponseDTO(session) } : null;
    }
}

export class DeleteVideoSessionUseCase implements IDeleteVideoSessionUseCase {
    constructor(private _sessionRepository: ISessionRepository) { }
    async execute(params: DeleteVideoSessionRequestDTO): Promise<DeleteVideoSessionResponseDTO> {
        await this._sessionRepository.delete(params.sessionId);
        return { message: 'Session deleted successfully' };
    }
}

export class GetAllVideoSessionsUseCase implements IGetAllVideoSessionsUseCase {
    constructor(private _sessionRepository: ISessionRepository) { }
    async execute(params: { search?: string; status?: string; instructor?: string; course?: string } = {}): Promise<SessionListResponseDTO[]> {
        const sessions = await this._sessionRepository.getAll(params);
        return sessions.map(session => VideoSessionMapper.toListResponseDTO(session));
    }
}

export class GetUserSessionsUseCase implements IGetUserSessionsUseCase {
    constructor(private _sessionRepository: ISessionRepository) { }
    async execute(params: { search?: string; status?: string; instructor?: string; course?: string; userId?: string } = {}): Promise<{ sessions: SessionListResponseDTO[], watchedCount: number }> {
        const sessions = await this._sessionRepository.getUserSessions(params);
        const userId = params.userId || '';

        const watchedCount = sessions.filter(session =>
            (Array.isArray(session.participants) && session.participants.includes(userId)) ||
            (Array.isArray(session.attendance) && session.attendance.some((a: AttendanceRecord) => a.userId === userId))
        ).length;

        const sessionList = sessions.map(session => VideoSessionMapper.toListResponseDTO(session));

        return { sessions: sessionList, watchedCount };
    }
}

export class UpdateVideoSessionStatusUseCase implements IUpdateVideoSessionStatusUseCase {
    constructor(private _sessionRepository: ISessionRepository) { }
    async execute(sessionId: string, status: VideoSessionStatus): Promise<UpdateVideoSessionStatusResponseDTO | null> {
        const session = await this._sessionRepository.update(sessionId, { status });

        if (!session) {
            return null;
        }

        if (status === VideoSessionStatus.Ongoing && !session.joinUrl) {
            const sessionIdStr = session.id;
            if (sessionIdStr) {
                const joinUrl = `${config.frontendUrl}/faculty/video-conference/${sessionIdStr}`;
                session.joinUrl = joinUrl;
                await this._sessionRepository.update(sessionIdStr, { joinUrl });
            }
        }

        if (status === VideoSessionStatus.Ended && session.joinUrl) {
            session.joinUrl = undefined;
            await this._sessionRepository.update(sessionId, { joinUrl: undefined });
        }

        let message = '';
        switch (status) {
            case VideoSessionStatus.Ongoing:
                message = 'Session started successfully';
                break;
            case VideoSessionStatus.Ended:
                message = 'Session ended successfully';
                break;
            case VideoSessionStatus.Scheduled:
                message = 'Session scheduled successfully';
                break;
            case VideoSessionStatus.Cancelled:
                message = 'Session cancelled successfully';
                break;
            default:
                message = 'Session status updated successfully';
        }

        return {
            success: true,
            message,
            session: VideoSessionMapper.toResponseDTO(session)
        };
    }
}

export class GetSessionAttendanceUseCase implements IGetSessionAttendanceUseCase {
    constructor(
        private _sessionRepository: ISessionRepository,
        private _authRepository: IAuthRepository
    ) { }
    async execute(sessionId: string, filters: GetSessionAttendanceRequestDTO): Promise<AttendanceRecordResponseDTO[]> {
        const session = await this._sessionRepository.getById(sessionId);
        if (!session) throw new Error('Session not found');

        let attendance = session.attendance || [];

        // 1. Fetch User Data via AuthRepository (Pure abstraction)
        const userIds = attendance.map((a) => a.userId);
        const users = await this._authRepository.findUsersByIds(userIds);
        const userMap = new Map(users.map((u) => [u.id, u]));

        // 2. Filter by Search (matching user details)
        if (filters.search && filters.search.trim() !== '') {
            const search = filters.search.toLowerCase();
            attendance = attendance.filter((a) => {
                const user = userMap.get(a.userId);
                return user && (
                    (user.firstName && user.firstName.toLowerCase().includes(search)) ||
                    (user.lastName && user.lastName.toLowerCase().includes(search)) ||
                    (user.email && user.email.toLowerCase().includes(search))
                );
            });
        }

        // 3. Filter by Decision
        if (filters.decision && filters.decision.trim() !== '' && filters.decision !== 'all') {
            const decision = filters.decision.toLowerCase();
            attendance = attendance.filter((a) => {
                if (!a.status) return decision === 'pending';
                const statusLower = a.status.toLowerCase();
                if ((decision === 'approved' || decision === 'approve') && (statusLower === 'approve' || statusLower === 'approved')) return true;
                if ((decision === 'denied' || decision === 'deny') && (statusLower === 'deny' || statusLower === 'denied')) return true;
                if (decision === 'pending' && statusLower === 'pending') return true;
                return statusLower === decision;
            });
        }

        // 4. Filter by Attendance Level
        if (filters.attendanceLevel && filters.attendanceLevel.trim() !== '' && filters.attendanceLevel !== 'all') {
            const level = filters.attendanceLevel.toLowerCase();
            attendance = attendance.filter((a) => {
                let totalMinutes = 0;
                if (Array.isArray(a.intervals)) {
                    totalMinutes = a.intervals.reduce((sum: number, interval) => {
                        if (interval.joinedAt && interval.leftAt) {
                            const joined = new Date(interval.joinedAt).getTime();
                            const left = new Date(interval.leftAt).getTime();
                            if (!isNaN(joined) && !isNaN(left) && left > joined) {
                                return sum + (left - joined) / 60000;
                            }
                        }
                        return sum;
                    }, 0);
                }
                let calculatedLevel = 'low';
                if (totalMinutes >= 60) calculatedLevel = 'high';
                else if (totalMinutes >= 30) calculatedLevel = 'medium';

                return calculatedLevel === level;
            });
        }

        // 5. Filter by Date Range
        if (filters.startDate || filters.endDate) {
            const start = filters.startDate ? new Date(filters.startDate) : null;
            const end = filters.endDate ? new Date(filters.endDate) : null;
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);

            attendance = attendance.filter((a) => {
                if (!Array.isArray(a.intervals) || a.intervals.length === 0) return false;
                return a.intervals.some((interval) => {
                    if (!interval.joinedAt) return false;
                    const joinDate = new Date(interval.joinedAt);
                    if (start && joinDate < start) return false;
                    if (end && joinDate > end) return false;
                    return true;
                });
            });
        }

        // 6. Transform to DTO
        return attendance
            .filter((a) => userMap.has(a.userId))
            .map((a) => {
                const user = userMap.get(a.userId);
                return {
                    id: a.userId,
                    username: user ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : '',
                    email: user ? user.email : '',
                    intervals: a.intervals || [],
                    status: a.status || null
                };
            });
    }
}

export class UpdateAttendanceStatusUseCase implements IUpdateAttendanceStatusUseCase {
    constructor(private _sessionRepository: ISessionRepository) { }
    async execute(sessionId: string, userId: string, status: string, name: string): Promise<void> {
        await this._sessionRepository.updateAttendanceStatus(sessionId, userId, status, name);
    }
}

export class RecordAttendanceJoinUseCase implements IRecordAttendanceJoinUseCase {
    constructor(private _sessionRepository: ISessionRepository) { }
    async execute(sessionId: string, userId: string): Promise<void> {
        await this._sessionRepository.recordAttendanceJoin(sessionId, userId);
    }
}

export class RecordAttendanceLeaveUseCase implements IRecordAttendanceLeaveUseCase {
    constructor(private _sessionRepository: ISessionRepository) { }
    async execute(sessionId: string, userId: string): Promise<void> {
        await this._sessionRepository.recordAttendanceLeave(sessionId, userId);
    }
}