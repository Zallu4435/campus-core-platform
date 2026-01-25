import { Types } from "mongoose";

export interface IFacultySource {
    _id: Types.ObjectId | string;
    fullName: string;
    email: string;
    phone: string;
    department: string;
    qualification: string;
    experience: number | string;
    aboutMe: string;
    cvUrl: string;
    certificatesUrl: string[];
    status: string;
    rejectedBy?: string;
    confirmationToken?: string;
    tokenExpiry?: Date | string;
    blocked: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    password?: string;
    [key: string]: unknown;
}

export interface IFacultyUserSource {
    _id: Types.ObjectId | string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    [key: string]: unknown;
}

export interface IDashboardStatsSource {
    totalSessions: number;
    totalAssignments: number;
    totalAttendance: number;
    [key: string]: unknown;
}

export interface IWeeklyAttendanceSource {
    day: string;
    attendance: number;
    [key: string]: unknown;
}

export interface IAssignmentPerformanceSource {
    assignment: string;
    score: number;
    submissions: number;
    status: string;
    [key: string]: unknown;
}

export interface ISessionDistributionSource {
    name: string;
    value: number;
    color: string;
    [key: string]: unknown;
}

export interface IRecentActivitySource {
    id: string;
    type: string;
    message: string;
    time: string;
    [key: string]: unknown;
}

export interface IFacultyDashboardDataSource {
    stats: IDashboardStatsSource;
    weeklyAttendance: IWeeklyAttendanceSource[];
    assignmentPerformance: IAssignmentPerformanceSource[];
    sessionDistribution: ISessionDistributionSource[];
    recentActivities: IRecentActivitySource[];
}
