import { useQuery } from '@tanstack/react-query';
import { studentDashboardService } from '../services/studentDashboardService';
import { StudentDashboardData, StudentInfo } from '../../domain/types/dashboard/user';


export const useStudentDashboard = (): StudentDashboardData & {
  studentInfo?: StudentInfo;
  studentInfoLoading: boolean;
  studentInfoError: unknown;
} => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => studentDashboardService.getAllDashboardData(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: studentInfo, isLoading: studentInfoLoading, error: studentInfoError } = useQuery({
    queryKey: ['student-dashboard-student-info'],
    queryFn: () => studentDashboardService.getStudentInfo(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const dashboard: Partial<StudentDashboardData> = data || {};

  const safeRefetch = () => refetch().then(() => { });

  return {
    announcements: dashboard?.announcements || [],
    deadlines: dashboard?.deadlines || [],
    classes: dashboard?.classes || [],
    newEvents: dashboard?.newEvents || [],
    calendarDays: dashboard?.calendarDays || [],
    isLoading,
    isLoadingAnnouncements: isLoading,
    isLoadingDeadlines: isLoading,
    isLoadingClasses: isLoading,
    isLoadingNewEvents: isLoading,
    isLoadingCalendarDays: isLoading,
    hasError: isError,
    dashboardError: error,
    announcementsError: error,
    deadlinesError: error,
    classesError: error,
    newEventsError: error,
    calendarDaysError: error,
    refetchDashboard: safeRefetch,
    refetchAnnouncements: safeRefetch,
    refetchDeadlines: safeRefetch,
    refetchClasses: safeRefetch,
    refetchNewEvents: safeRefetch,
    refetchCalendarDays: safeRefetch,
    studentInfo: studentInfo?.data,
    studentInfoLoading,
    studentInfoError,
  };
};