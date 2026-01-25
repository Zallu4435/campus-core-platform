import { Types } from "mongoose";

export interface PerformanceRawData {
    userCount: number;
    facultyCount: number;
    courseCount: number;
    admissionCount: number;
    paymentCount: number;
    enquiryCount: number;
    notificationCount: number;
    communicationCount: number;
    videoCount: number;
    sportsCount: number;
    diplomaCount: number;
    eventsCount: number;
    clubsCount: number;
}

export interface CompletedPaymentsAggResult {
    _id: null;
    total: number;
}

export interface DashboardMetricsRaw {
    totalUsers: number;
    totalFaculty: number;
    totalCourses: number;
    pendingAdmissions: number;
    completedPayments: CompletedPaymentsAggResult[];
}

export interface UserGrowthDataRaw {
    month: string;
    usersCount: number;
    facultyCount: number;
}

export interface RevenuePaymentAggResult {
    _id: string;
    total: number;
}

export interface RevenueDataRaw {
    month: string;
    payments: RevenuePaymentAggResult[];
}

export interface PopulatedUserFields {
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface RecentAdmissionRaw {
    _id: Types.ObjectId | string;
    status?: string;
    personal?: { fullName?: string };
    registerId?: PopulatedUserFields;
    createdAt?: Date;
}

export interface RecentPaymentRaw {
    _id: Types.ObjectId | string;
    amount?: number;
    method?: string;
    studentId?: PopulatedUserFields;
    date?: Date;
    createdAt?: Date;
}

export interface RecentEnquiryRaw {
    _id: Types.ObjectId | string;
    name?: string;
    subject?: string;
    createdAt?: Date;
}

export interface RecentNotificationRaw {
    _id: Types.ObjectId | string;
    title?: string;
    createdAt?: Date;
}

export interface ActivityItemRaw {
    recentAdmissions: RecentAdmissionRaw[];
    recentPayments: RecentPaymentRaw[];
    recentEnquiries: RecentEnquiryRaw[];
    recentNotifications: RecentNotificationRaw[];
}

export interface SystemAlertRaw {
    pendingAdmissions: number;
    failedPayments: number;
    overdueCharges: number;
    completedPayments: number;
}

export interface DashboardDataRaw {
    metricsRaw: DashboardMetricsRaw;
    userGrowthRaw: UserGrowthDataRaw[];
    revenueRaw: RevenueDataRaw[];
    performanceRaw: PerformanceRawData;
    activitiesRaw: ActivityItemRaw;
    alertsRaw: SystemAlertRaw;
}
