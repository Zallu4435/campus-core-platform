export interface DashboardStats {
    totalSessions: number;
    totalAssignments: number;
    totalAttendance: number;
}

export interface WeeklyAttendance {
    day: string;
    attendance: number;
}

export interface AssignmentPerformance {
    assignment: string;
    score: number;
    submissions: number;
}

export interface SessionDistribution {
    name: string;
    value: number;
    color: string;
}

export interface RecentActivity {
    id: string;
    type: 'attendance' | 'assignment' | 'announcement' | 'system';
    message: string;
    time: string;
}

export interface FacultyDashboardData {
    stats: DashboardStats;
    weeklyAttendance: WeeklyAttendance[];
    assignmentPerformance: AssignmentPerformance[];
    sessionDistribution: SessionDistribution[];
    recentActivities: RecentActivity[];
}
