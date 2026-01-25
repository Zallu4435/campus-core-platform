import { IStudentDashboardRepository } from '../../../application/student/repositories/IStudentDashboardRepository';
import { AssignmentModel } from '../../database/mongoose/assignment/AssignmentModel';
import { CampusEventModel } from '../../database/mongoose/events/CampusEventModel';
import { TeamModel } from '../../database/mongoose/sport/sports.model';
import { ClubModel } from '../../database/mongoose/clubs/ClubModel';
import { NotificationModel } from '../../database/mongoose/notification/notification.model';
import { VideoSessionModel } from '../../database/mongoose/session/session.model';
import { User as UserModel } from '../../database/mongoose/auth/user.model';
import { ProgramModel } from '../../database/mongoose/academic/studentProgram.model';
import { MessageModel } from '../../database/mongoose/communication/communication.model';
import { Model } from 'mongoose';
import {
  IAnnouncementSource,
  IDeadlineSource,
  IClassSource,
  IDashboardEventSource,
  IUserInfoSource
} from './infraTypes';

export class StudentDashboardRepository implements IStudentDashboardRepository {

  async getAnnouncements(): Promise<Record<string, unknown>[]> {
    const latestMessage = await (MessageModel as unknown as Model<IAnnouncementSource>).findOne({
      isBroadcast: true
    }).sort({ createdAt: -1 }).lean() as unknown as IAnnouncementSource | null;

    const latestNotification = await NotificationModel.findOne({
      recipientType: 'all_students'
    }).sort({ createdAt: -1 }).lean() as unknown as IAnnouncementSource | null;

    return [latestMessage, latestNotification].filter((item): item is IAnnouncementSource => !!item) as unknown as Record<string, unknown>[];
  }

  async getDeadlines(): Promise<Record<string, unknown>[]> {
    const docs = await AssignmentModel.find()
      .sort({ dueDate: 1 })
      .limit(3)
      .lean() as unknown as IDeadlineSource[];
    return docs as unknown as Record<string, unknown>[];
  }

  async getClasses(): Promise<Record<string, unknown>[]> {
    const docs = await VideoSessionModel.find().sort({ createdAt: -1 }).limit(3).lean() as unknown as IClassSource[];
    return docs as unknown as Record<string, unknown>[];
  }

  async getCalendarDays(): Promise<{ events: Record<string, unknown>[]; sports: Record<string, unknown>[]; clubs: Record<string, unknown>[] }> {
    const [events, sports, clubs] = await Promise.all([
      CampusEventModel.find().lean() as unknown as Promise<IDashboardEventSource[]>,
      TeamModel.find().lean() as unknown as Promise<IDashboardEventSource[]>,
      ClubModel.find().lean() as unknown as Promise<IDashboardEventSource[]>
    ]);

    return {
      events: events as unknown as Record<string, unknown>[],
      sports: sports as unknown as Record<string, unknown>[],
      clubs: clubs as unknown as Record<string, unknown>[]
    };
  }

  async getNewEvents(): Promise<Record<string, unknown>[]> {
    const [latestEvent, latestSport, latestClub] = await Promise.all([
      CampusEventModel.findOne().sort({ date: -1 }).lean() as unknown as Promise<IDashboardEventSource | null>,
      TeamModel.findOne().sort({ date: -1 }).lean() as unknown as Promise<IDashboardEventSource | null>,
      ClubModel.findOne().sort({ date: -1 }).lean() as unknown as Promise<IDashboardEventSource | null>,
    ]);
    return [
      latestEvent,
      latestSport,
      latestClub
    ].filter((item): item is IDashboardEventSource => !!item) as unknown as Record<string, unknown>[];
  }

  async getUserInfo(studentId: string) {
    const user = await UserModel.findById(studentId).select('firstName lastName email profilePicture').lean() as unknown as IUserInfoSource | null;
    if (!user) {
      throw new Error('User not found');
    }
    const program = await ProgramModel.findOne({ studentId: studentId }).select('degree').lean() as unknown as Record<string, unknown> | null;

    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
      course: program ? (program.degree as string) : undefined,
    };
  }
} 