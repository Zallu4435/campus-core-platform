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
import { IStudentDashboardRepository } from "../repositories/IStudentDashboardRepository";
import { Announcement, Deadline, ClassInfo, SpecialDate } from "../../../domain/student/entities/StudentDashboardTypes";
import { StudentDashboardMapper } from "../../../infrastructure/repositories/student/StudentDashboardMapper";
import { STUDENT_DASHBOARD_CONSTANTS } from "../constants/StudentDashboardConstants";
import {
  IGetAnnouncementsUseCase,
  IGetDeadlinesUseCase,
  IGetClassesUseCase,
  IGetCalendarDaysUseCase,
  IGetNewEventsUseCase,
  IGetUserInfoForDashboardUseCase,
} from './IStudentDashboardUseCases';
import { StudentNotFoundError, StudentValidationError } from "../../../domain/student/errors/StudentErrors";

export class GetAnnouncementsUseCase implements IGetAnnouncementsUseCase {
  constructor(private _repo: IStudentDashboardRepository) { }

  async execute(params: GetAnnouncementsRequestDTO): Promise<Announcement[]> {
    if (!params.studentId) throw new StudentValidationError('studentId', 'Student ID is required');
    const rawData = await this._repo.getAnnouncements();
    return rawData
      .filter((raw): raw is Record<string, unknown> => !!raw)
      .map(raw => StudentDashboardMapper.toAnnouncement(raw))
      .slice(0, STUDENT_DASHBOARD_CONSTANTS.MAX_DASHBOARD_ITEMS);
  }
}

export class GetDeadlinesUseCase implements IGetDeadlinesUseCase {
  constructor(private _repo: IStudentDashboardRepository) { }

  async execute(params: GetDeadlinesRequestDTO): Promise<Deadline[]> {
    if (!params.studentId) throw new StudentValidationError('studentId', 'Student ID is required');
    const rawData = await this._repo.getDeadlines();
    return rawData.map(raw =>
      StudentDashboardMapper.toDeadline(raw, STUDENT_DASHBOARD_CONSTANTS.DEADLINE_URGENCY_DAYS)
    );
  }
}

export class GetClassesUseCase implements IGetClassesUseCase {
  constructor(private _repo: IStudentDashboardRepository) { }

  async execute(params: GetClassesRequestDTO): Promise<ClassInfo[]> {
    if (!params.studentId) throw new StudentValidationError('studentId', 'Student ID is required');
    const rawData = await this._repo.getClasses();
    return rawData.map(raw => StudentDashboardMapper.toClassInfo(raw));
  }
}

export class GetCalendarDaysUseCase implements IGetCalendarDaysUseCase {
  constructor(private _repo: IStudentDashboardRepository) { }

  async execute(params: GetCalendarDaysRequestDTO): Promise<Record<number, SpecialDate[]>> {
    if (!params.studentId) throw new StudentValidationError('studentId', 'Student ID is required');

    const now = new Date();
    const targetMonth = params.month !== undefined ? params.month : now.getMonth();
    const targetYear = params.year !== undefined ? params.year : now.getFullYear();

    const { events, sports, clubs } = await this._repo.getCalendarDays();
    const dayTypeMap: Record<number, SpecialDate[]> = {};

    const addEntry = (dateStr: string, type: string, title: string) => {
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;

      if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {
        const day = d.getDate();
        if (!dayTypeMap[day]) dayTypeMap[day] = [];
        dayTypeMap[day].push({ type, title, date: dateStr });
      }
    };

    events.forEach(e => addEntry(e.date as string, 'event', e.title as string));
    sports.forEach(s => {
      const sportData = s as Record<string, unknown>;
      if (Array.isArray(sportData.upcomingGames)) {
        (sportData.upcomingGames as Record<string, unknown>[]).forEach(g => addEntry(g.date as string, 'sport', sportData.title as string));
      }
    });
    clubs.forEach(c => {
      const clubData = c as Record<string, unknown>;
      if (Array.isArray(clubData.upcomingEvents)) {
        (clubData.upcomingEvents as Record<string, unknown>[]).forEach(ev => addEntry(ev.date as string, 'club', clubData.name as string));
      }
    });

    return dayTypeMap;
  }
}

export class GetNewEventsUseCase implements IGetNewEventsUseCase {
  constructor(private _repo: IStudentDashboardRepository) { }

  async execute(params: GetNewEventsRequestDTO): Promise<NewEventDTO[]> {
    if (!params.studentId) throw new StudentValidationError('studentId', 'Student ID is required');
    const rawData = await this._repo.getNewEvents();
    return rawData
      .filter((raw): raw is Record<string, unknown> => !!raw)
      .map(raw => StudentDashboardMapper.toNewEvent(raw));
  }
}

export class GetUserInfoForDashboardUseCase implements IGetUserInfoForDashboardUseCase {
  constructor(private _repo: IStudentDashboardRepository) { }

  async execute(params: GetUserInfoRequestDTO): Promise<GetUserInfoResponseDTO> {
    if (!params.studentId) throw new StudentValidationError('studentId', 'Student ID is required');
    const userInfo = await this._repo.getUserInfo(params.studentId);
    if (!userInfo) throw new StudentNotFoundError(params.studentId);
    return userInfo;
  }
}