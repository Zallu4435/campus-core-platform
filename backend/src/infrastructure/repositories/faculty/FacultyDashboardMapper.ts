
import {
    DashboardStats,
    FacultyDashboardData,
    WeeklyAttendance,
    AssignmentPerformance,
    SessionDistribution,
    RecentActivity
} from "../../../application/faculty/dtos/FacultyDashboardDTOs";
import {
    IDashboardStatsSource,
    IWeeklyAttendanceSource,
    IAssignmentPerformanceSource,
    ISessionDistributionSource,
    IRecentActivitySource,
    IFacultyDashboardDataSource
} from "./infraTypes";

export class FacultyDashboardMapper {
    static toStatsDomain(stats: IDashboardStatsSource): DashboardStats {
        return {
            totalSessions: stats.totalSessions || 0,
            totalAssignments: stats.totalAssignments || 0,
            totalAttendance: stats.totalAttendance || 0
        };
    }

    static toWeeklyAttendanceDomain(data: IWeeklyAttendanceSource[]): WeeklyAttendance[] {
        return data.map(item => ({
            day: item.day,
            attendance: item.attendance
        }));
    }

    static toAssignmentPerformanceDomain(data: IAssignmentPerformanceSource[]): AssignmentPerformance[] {
        return data.map(item => ({
            assignment: item.assignment,
            score: item.score,
            submissions: item.submissions
        }));
    }

    static toSessionDistributionDomain(data: ISessionDistributionSource[]): SessionDistribution[] {
        return data.map(item => ({
            name: item.name,
            value: item.value,
            color: item.color
        }));
    }

    static toRecentActivityDomain(data: IRecentActivitySource[]): RecentActivity[] {
        return data.map(item => ({
            id: item.id,
            type: item.type as any,
            message: item.message,
            time: item.time
        }));
    }

    static toDashboardDataDomain(data: IFacultyDashboardDataSource): FacultyDashboardData {
        return {
            stats: this.toStatsDomain(data.stats),
            weeklyAttendance: this.toWeeklyAttendanceDomain(data.weeklyAttendance),
            assignmentPerformance: this.toAssignmentPerformanceDomain(data.assignmentPerformance),
            sessionDistribution: this.toSessionDistributionDomain(data.sessionDistribution),
            recentActivities: this.toRecentActivityDomain(data.recentActivities)
        };
    }
}
