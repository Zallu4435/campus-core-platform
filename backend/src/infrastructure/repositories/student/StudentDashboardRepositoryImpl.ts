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

export class StudentDashboardRepository implements IStudentDashboardRepository {

  async getAnnouncements(): Promise<Record<string, unknown>[]> {
    const latestMessage = await (MessageModel as any).findOne({
      isBroadcast: true
    }).sort({ createdAt: -1 }).lean();

    const latestNotification = await NotificationModel.findOne({
      recipientType: 'all_students'
    }).sort({ createdAt: -1 }).lean();

    return [latestMessage as unknown as Record<string, unknown>, latestNotification as unknown as Record<string, unknown>].filter((item): item is Record<string, unknown> => !!item);
  }

  async getDeadlines(): Promise<Record<string, unknown>[]> {
    const docs = await AssignmentModel.find()
      .sort({ dueDate: 1 })
      .limit(3)
      .lean();
    return docs as unknown as Record<string, unknown>[];
  }

  async getClasses(): Promise<Record<string, unknown>[]> {
    const docs = await VideoSessionModel.find().sort({ createdAt: -1 }).limit(3).lean();
    return docs as unknown as Record<string, unknown>[];
  }

  async getCalendarDays(): Promise<{ events: Record<string, unknown>[]; sports: Record<string, unknown>[]; clubs: Record<string, unknown>[] }> {
    const [events, sports, clubs] = await Promise.all([
      CampusEventModel.find().lean(),
      TeamModel.find().lean(),
      ClubModel.find().lean()
    ]);

    return {
      events: events as unknown as Record<string, unknown>[],
      sports: sports as unknown as Record<string, unknown>[],
      clubs: clubs as unknown as Record<string, unknown>[]
    };
  }

  async getNewEvents(): Promise<Record<string, unknown>[]> {
    const [latestEvent, latestSport, latestClub] = await Promise.all([
      CampusEventModel.findOne().sort({ date: -1 }).lean(),
      TeamModel.findOne().sort({ date: -1 }).lean(),
      ClubModel.findOne().sort({ date: -1 }).lean(),
    ]);
    return [
      latestEvent as unknown as Record<string, unknown>,
      latestSport as unknown as Record<string, unknown>,
      latestClub as unknown as Record<string, unknown>
    ].filter((item): item is Record<string, unknown> => !!item);
  }

  async getUserInfo(studentId: string) {
    const user = await UserModel.findById(studentId).select('firstName lastName email profilePicture').lean();
    if (!user) {
      throw new Error('User not found');
    }
    const program = await ProgramModel.findOne({ studentId: studentId }).select('degree').lean();

    const userObj = user as unknown as Record<string, unknown>;
    const programObj = program as unknown as Record<string, unknown>;

    return {
      id: userObj._id?.toString() || '',
      firstName: userObj.firstName as string,
      lastName: userObj.lastName as string,
      email: userObj.email as string,
      profilePicture: userObj.profilePicture as string | undefined,
      course: programObj ? (programObj.degree as string) : undefined,
    };
  }
} 