import {
  DashboardStats,
  FacultyDashboardData,
  WeeklyAttendance,
  AssignmentPerformance,
  SessionDistribution,
  RecentActivity
} from "../../dtos/FacultyDashboardDTOs";

export interface IFacultyDashboardRepository {
  getDashboardStats(facultyId: string): Promise<DashboardStats>;
  getDashboardData(facultyId: string): Promise<FacultyDashboardData>;
  getWeeklyAttendance(facultyId: string): Promise<WeeklyAttendance[]>;
  getAssignmentPerformance(facultyId: string): Promise<AssignmentPerformance[]>;
  getSessionDistribution(facultyId: string): Promise<SessionDistribution[]>;
  getRecentActivities(facultyId: string): Promise<RecentActivity[]>;
} 