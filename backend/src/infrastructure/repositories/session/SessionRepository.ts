import { FilterQuery } from 'mongoose';
import { ISessionRepository } from '../../../application/session/repositories/ISessionRepository';
import { VideoSession } from '../../../domain/session/entities/VideoSession';
import { VideoSessionModel } from '../../database/mongoose/session/session.model';
import { VideoSessionMapper } from './mappers/VideoSessionMapper';
import { IVideoSessionSource } from './infraTypes';

export class SessionRepository implements ISessionRepository {
  async create(sessionData: Partial<VideoSession>): Promise<VideoSession> {
    const doc = await VideoSessionModel.create(sessionData);
    return VideoSessionMapper.toDomain(doc.toObject() as unknown as IVideoSessionSource);
  }

  async join(sessionId: string, participantId: string): Promise<VideoSession> {
    const session = await VideoSessionModel.findById(sessionId);
    if (!session) throw new Error('Session not found');

    if (!session.participants.includes(participantId)) {
      session.participants.push(participantId);
      await session.save();
    }
    return VideoSessionMapper.toDomain(session.toObject() as unknown as IVideoSessionSource);
  }

  async getById(sessionId: string): Promise<VideoSession | null> {
    const session = await VideoSessionModel.findById(sessionId).lean() as unknown as IVideoSessionSource | null;
    return session ? VideoSessionMapper.toDomain(session) : null;
  }

  async update(sessionId: string, data: Partial<VideoSession>): Promise<VideoSession | null> {
    const session = await VideoSessionModel.findByIdAndUpdate(sessionId, data, { new: true }).lean() as unknown as IVideoSessionSource | null;
    return session ? VideoSessionMapper.toDomain(session) : null;
  }

  async delete(sessionId: string): Promise<void> {
    await VideoSessionModel.findByIdAndDelete(sessionId);
  }

  async getAll(params: { search?: string; status?: string; instructor?: string; course?: string } = {}): Promise<VideoSession[]> {
    const query: FilterQuery<IVideoSessionSource> = {};

    if (params.status && params.status !== 'all') {
      if (params.status === 'upcoming') {
        query.$or = [
          { status: 'upcoming' },
          { status: 'scheduled' }
        ];
      } else {
        query.status = params.status;
      }
    }

    if (params.instructor && params.instructor !== 'all') {
      query.instructor = params.instructor;
    }

    if (params.course && params.course !== 'all') {
      query.course = params.course;
    }

    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      const searchConditions = [
        { title: searchRegex },
        { description: searchRegex },
        { instructor: searchRegex },
        { course: searchRegex }
      ];

      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const sessions = await VideoSessionModel.find(query).sort({ createdAt: -1 }).lean() as unknown as IVideoSessionSource[];
    return VideoSessionMapper.toDomainList(sessions);
  }

  async getUserSessions(params: { search?: string; status?: string; instructor?: string; course?: string; userId?: string } = {}): Promise<VideoSession[]> {
    return this.getAll(params);
  }

  async updateAttendanceStatus(sessionId: string, userId: string, status: string, name: string): Promise<void> {
    const session = await VideoSessionModel.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const attendanceIndex = session.attendance?.findIndex((a) => a.userId === userId) ?? -1;
    if (attendanceIndex === -1) throw new Error('Attendance record not found');

    if (session.attendance) {
      session.attendance[attendanceIndex].status = status;
    }

    if (status === 'approved' || status === 'approve') {
      session.attendeeList = session.attendeeList?.filter((a) => a.id !== userId) ?? [];
      session.attendeeList.push({ id: userId, name });
    } else {
      session.attendeeList = session.attendeeList?.filter((a) => a.id !== userId) ?? [];
    }

    session.markModified('attendance');
    session.markModified('attendeeList');

    await session.save();
  }

  async recordAttendanceJoin(sessionId: string, userId: string): Promise<void> {
    const now = new Date();
    const result = await VideoSessionModel.findOneAndUpdate(
      {
        _id: sessionId,
        'attendance.userId': userId
      },
      {
        $push: {
          'attendance.$.intervals': { joinedAt: now }
        }
      },
      { new: true }
    );

    if (!result) {
      await VideoSessionModel.findOneAndUpdate(
        { _id: sessionId },
        {
          $push: {
            attendance: {
              userId: userId,
              intervals: [{ joinedAt: now }]
            }
          }
        },
        { new: true }
      );
    }
  }

  async recordAttendanceLeave(sessionId: string, userId: string): Promise<void> {
    const now = new Date();

    const session = await VideoSessionModel.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const attendance = session.attendance?.find((a) => a.userId === userId);
    if (!attendance || !attendance.intervals || attendance.intervals.length === 0) {
      throw new Error('No attendance record found');
    }

    const lastInterval = attendance.intervals[attendance.intervals.length - 1];
    if (lastInterval.leftAt) {
      return;
    }

    const result = await VideoSessionModel.findOneAndUpdate(
      {
        _id: sessionId,
        'attendance.userId': userId
      },
      {
        $set: {
          'attendance.$.intervals.$[lastInterval].leftAt': now
        }
      },
      {
        new: true,
        arrayFilters: [
          { 'lastInterval.leftAt': { $exists: false } }
        ]
      }
    );

    if (!result) {
      throw new Error('Failed to update attendance leave');
    }
  }
}