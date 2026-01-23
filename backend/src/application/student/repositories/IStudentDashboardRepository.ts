export interface IStudentDashboardRepository {
  getAnnouncements(): Promise<Record<string, unknown>[]>;
  getDeadlines(): Promise<Record<string, unknown>[]>;
  getClasses(): Promise<Record<string, unknown>[]>;
  getCalendarDays(): Promise<{
    events: Record<string, unknown>[];
    sports: Record<string, unknown>[];
    clubs: Record<string, unknown>[]
  }>;
  getNewEvents(): Promise<Record<string, unknown>[]>;
  getUserInfo(studentId: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    course?: string;
  }>;
} 