
import {
    DashboardStats,
    FacultyDashboardData,
    WeeklyAttendance,
    AssignmentPerformance,
    SessionDistribution,
    RecentActivity
} from "../../../domain/faculty/dashboard/entities/FacultyDashboardEntities";

export class FacultyDashboardMapper {
    static toStatsDomain(stats: any): DashboardStats {
        return {
            totalSessions: stats.totalSessions || 0,
            totalAssignments: stats.totalAssignments || 0,
            totalAttendance: stats.totalAttendance || 0
        };
    }

    static toWeeklyAttendanceDomain(data: any[]): WeeklyAttendance[] {
        return data.map(item => ({
            day: item.day,
            attendance: item.attendance
        }));
    }

    static toAssignmentPerformanceDomain(data: any[]): AssignmentPerformance[] {
        return data.map(item => ({
            assignment: item.assignment,
            score: item.score,
            submissions: item.submissions
        }));
    }

    static toSessionDistributionDomain(data: any[]): SessionDistribution[] {
        return data.map(item => ({
            name: item.name,
            value: item.value,
            color: item.color
        }));
    }

    static toRecentActivityDomain(data: any[]): RecentActivity[] {
        return data.map(item => ({
            id: item.id,
            type: item.type,
            message: item.message,
            time: item.time
        }));
    }

    static toDashboardDataDomain(data: any): FacultyDashboardData {
        return {
            stats: this.toStatsDomain(data.stats),
            weeklyAttendance: this.toWeeklyAttendanceDomain(data.weeklyAttendance),
            assignmentPerformance: this.toAssignmentPerformanceDomain(data.assignmentPerformance),
            sessionDistribution: this.toSessionDistributionDomain(data.sessionDistribution),
            recentActivities: this.toRecentActivityDomain(data.recentActivities)
        };
    }
}
