import {
    DashboardMetrics,
    UserGrowthDataPoint,
    RevenueDataPoint,
    PerformanceMetric,
    ActivityItem,
    SystemAlert,
} from '../../../domain/admindashboard/entities/AdminDashboardEntities';
import {
    DashboardMetricsRaw,
    UserGrowthDataRaw,
    RevenueDataRaw,
    PerformanceRawData,
    SystemAlertRaw,
    RecentAdmissionRaw,
    RecentPaymentRaw,
    RecentEnquiryRaw,
    RecentNotificationRaw,
} from '../../../domain/admindashboard/entities/AdminDashboardTypes';

export class DashboardMapper {
    static toDashboardMetrics(raw: DashboardMetricsRaw): DashboardMetrics {
        const totalRevenue = raw.completedPayments[0]?.total || 0;
        return DashboardMetrics.create({
            totalUsers: raw.totalUsers + raw.totalFaculty,
            totalRevenue,
            activeCourses: raw.totalCourses,
            pendingApprovals: raw.pendingAdmissions,
        });
    }

    static toUserGrowthDataPoints(rawArray: UserGrowthDataRaw[]): UserGrowthDataPoint[] {
        let cumulativeUsers = 0;
        return rawArray.map((item) => {
            const users = item.usersCount + item.facultyCount;
            cumulativeUsers += users;
            const target = Math.floor(cumulativeUsers * 1.1) + 2;
            return UserGrowthDataPoint.create({
                month: item.month,
                users: cumulativeUsers,
                target,
            });
        });
    }

    static toRevenueDataPoints(rawArray: RevenueDataRaw[]): RevenueDataPoint[] {
        return rawArray.map((item) => {
            let tuition = 0, fees = 0, other = 0;
            item.payments.forEach((p) => {
                if (p._id === 'Credit Card' || p._id === 'Bank Transfer') tuition += p.total;
                else if (p._id === 'Razorpay' || p._id === 'stripe') fees += p.total;
                else if (p._id === 'Financial Aid') other += p.total;
            });
            return RevenueDataPoint.create({
                month: item.month,
                tuition,
                fees,
                other,
            });
        });
    }

    static toPerformanceMetrics(raw: PerformanceRawData): PerformanceMetric[] {
        return [
            PerformanceMetric.create({ name: 'User Management', value: Math.round(70 + (raw.userCount * 2)), color: '#6366F1' }),
            PerformanceMetric.create({ name: 'Faculty Management', value: Math.round(70 + (raw.facultyCount * 3)), color: '#10B981' }),
            PerformanceMetric.create({ name: 'Course Management', value: Math.round(70 + (raw.courseCount * 4)), color: '#F59E0B' }),
            PerformanceMetric.create({ name: 'Admission Management', value: Math.round(70 + (raw.admissionCount * 1.5)), color: '#EF4444' }),
            PerformanceMetric.create({ name: 'Payment Management', value: Math.round(70 + (raw.paymentCount * 2.5)), color: '#8B5CF6' }),
            PerformanceMetric.create({ name: 'Enquiry Management', value: Math.round(70 + (raw.enquiryCount * 2)), color: '#06B6D4' }),
            PerformanceMetric.create({ name: 'Notification Management', value: Math.round(70 + (raw.notificationCount * 3)), color: '#EC4899' }),
            PerformanceMetric.create({ name: 'Communication Management', value: Math.round(70 + (raw.communicationCount * 4)), color: '#F97316' }),
            PerformanceMetric.create({ name: 'Video Management', value: Math.round(70 + (raw.videoCount * 4)), color: '#F472B6' }),
            PerformanceMetric.create({ name: 'Sports Management', value: Math.round(70 + (raw.sportsCount * 5)), color: '#22D3EE' }),
            PerformanceMetric.create({ name: 'Diploma Management', value: Math.round(70 + (raw.diplomaCount * 6)), color: '#A78BFA' }),
            PerformanceMetric.create({ name: 'Events Management', value: Math.round(70 + (raw.eventsCount * 4.5)), color: '#FB7185' }),
            PerformanceMetric.create({ name: 'Clubs Management', value: Math.round(70 + (raw.clubsCount * 2)), color: '#FBBF24' }),
        ];
    }

    static toActivityItems(raw: {
        recentAdmissions: RecentAdmissionRaw[];
        recentPayments: RecentPaymentRaw[];
        recentEnquiries: RecentEnquiryRaw[];
        recentNotifications: RecentNotificationRaw[];
    }): ActivityItem[] {
        const activities: ActivityItem[] = [];

        raw.recentAdmissions.forEach((admission) => {
            const fullName = admission.personal?.fullName ||
                (admission.registerId?.firstName + ' ' + admission.registerId?.lastName) || 'Unknown';
            activities.push(ActivityItem.create({
                id: (admission._id as string) || '',
                action: `Admission ${admission.status || 'pending'}: ${fullName}`,
                user: fullName,
                time: admission.createdAt ? new Date(admission.createdAt).toISOString() : '',
                avatar: '',
                type: admission.status === 'approved' ? 'success' : admission.status === 'rejected' ? 'warning' : 'info',
                isRead: false,
            }));
        });

        raw.recentPayments.forEach((payment) => {
            const studentName = payment.studentId?.firstName && payment.studentId?.lastName
                ? `${payment.studentId.firstName} ${payment.studentId.lastName}`
                : 'Unknown Student';
            activities.push(ActivityItem.create({
                id: (payment._id as string) || '',
                action: `Payment received: $${payment.amount || 0} via ${payment.method || 'Unknown method'}`,
                user: studentName,
                time: payment.createdAt ? new Date(payment.createdAt).toISOString() : '',
                avatar: '',
                type: 'success',
                isRead: false,
            }));
        });

        raw.recentEnquiries.forEach((enquiry) => {
            const enquiryName = enquiry.name || 'Anonymous';
            activities.push(ActivityItem.create({
                id: (enquiry._id as string) || '',
                action: `New enquiry: ${enquiry.subject || 'General enquiry'}`,
                user: enquiryName,
                time: enquiry.createdAt ? new Date(enquiry.createdAt).toISOString() : '',
                avatar: '',
                type: 'info',
                isRead: false,
            }));
        });

        raw.recentNotifications.forEach((notification) => {
            activities.push(ActivityItem.create({
                id: (notification._id as string) || '',
                action: `Notification sent: ${notification.title || 'System notification'}`,
                user: 'System',
                time: notification.createdAt ? new Date(notification.createdAt).toISOString() : '',
                avatar: 'SY',
                type: 'info',
                isRead: false,
            }));
        });

        activities.sort((a, b) => {
            return new Date(b.time).getTime() - new Date(a.time).getTime();
        });

        return activities.slice(0, 5);
    }

    static toSystemAlerts(raw: SystemAlertRaw): SystemAlert[] {
        const alerts: SystemAlert[] = [];

        if (raw.pendingAdmissions > 0) {
            alerts.push(SystemAlert.create({
                id: '1',
                title: `${raw.pendingAdmissions} admission applications pending`,
                message: 'Requires immediate attention',
                type: 'warning',
                priority: raw.pendingAdmissions > 10 ? 'high' : 'medium',
                timestamp: new Date().toISOString(),
                isDismissed: false,
            }));
        }

        if (raw.failedPayments > 0) {
            alerts.push(SystemAlert.create({
                id: '3',
                title: `${raw.failedPayments} payment failures detected`,
                message: 'Follow-up required',
                type: 'error',
                priority: 'high',
                timestamp: new Date().toISOString(),
                isDismissed: false,
            }));
        }

        if (raw.overdueCharges > 0) {
            alerts.push(SystemAlert.create({
                id: '4',
                title: `${raw.overdueCharges} overdue charges detected`,
                message: 'Payment collection required',
                type: 'error',
                priority: 'high',
                timestamp: new Date().toISOString(),
                isDismissed: false,
            }));
        }

        if (raw.completedPayments > 0) {
            alerts.push(SystemAlert.create({
                id: '5',
                title: `${raw.completedPayments} payments processed successfully`,
                message: 'System operating normally',
                type: 'success',
                priority: 'low',
                timestamp: new Date().toISOString(),
                isDismissed: false,
            }));
        }

        return alerts;
    }
}
