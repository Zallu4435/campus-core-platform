export interface DashboardStatsResponseDTO {
  totalSessions: number;
  totalAssignments: number;
  totalAttendance: number;
}

export interface WeeklyAttendanceResponseDTO {
  day: string;
  attendance: number;
}

export interface AssignmentPerformanceResponseDTO {
  assignment: string;
  score: number;
  submissions: number;
}

export interface SessionDistributionResponseDTO {
  name: string;
  value: number;
  color: string;
}

export interface RecentActivityResponseDTO {
  id: string;
  type: 'attendance' | 'assignment' | 'announcement' | 'system';
  message: string;
  time: string;
}

export interface FacultyDashboardDataResponseDTO {
  stats: DashboardStatsResponseDTO;
  weeklyAttendance: WeeklyAttendanceResponseDTO[];
  assignmentPerformance: AssignmentPerformanceResponseDTO[];
  sessionDistribution: SessionDistributionResponseDTO[];
  recentActivities: RecentActivityResponseDTO[];
}

export interface GetFacultyDashboardStatsResponseDTO {
  stats: DashboardStatsResponseDTO;
}

export interface GetFacultyDashboardDataResponseDTO {
  dashboardData: FacultyDashboardDataResponseDTO;
}

export interface GetFacultyWeeklyAttendanceResponseDTO {
  weeklyAttendance: WeeklyAttendanceResponseDTO[];
}

export interface GetFacultyCoursePerformanceResponseDTO {
  assignmentPerformance: AssignmentPerformanceResponseDTO[];
}

export interface GetFacultySessionDistributionResponseDTO {
  sessionDistribution: SessionDistributionResponseDTO[];
}

export interface GetFacultyRecentActivitiesResponseDTO {
  recentActivities: RecentActivityResponseDTO[];
}

export interface ResponseDTO<T> {
  data: T | { error: string };
  success: boolean;
}

 