import { VideoSession } from '../../../domain/session/entities/VideoSession';
import { VideoSessionStatus } from '../../../domain/session/enums/VideoSessionStatus';

export interface ISessionRepository {
  create(sessionData: Partial<VideoSession>): Promise<VideoSession>;
  join(sessionId: string, participantId: string): Promise<VideoSession>;
  getById(sessionId: string): Promise<VideoSession | null>;
  update(sessionId: string, data: Partial<VideoSession>): Promise<VideoSession | null>;
  delete(sessionId: string): Promise<void>;
  getAll(params: { search?: string; status?: string; instructor?: string; course?: string }): Promise<VideoSession[]>;
  getUserSessions(params: { search?: string; status?: string; instructor?: string; course?: string; userId?: string }): Promise<VideoSession[]>;
  updateAttendanceStatus(sessionId: string, userId: string, status: string, name: string): Promise<void>;
  recordAttendanceJoin(sessionId: string, userId: string): Promise<void>;
  recordAttendanceLeave(sessionId: string, userId: string): Promise<void>;
}
