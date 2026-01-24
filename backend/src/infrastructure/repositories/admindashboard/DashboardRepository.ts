import { IDashboardRepository } from '../../../application/admindashboard/repositories/IDashboardRepository';
import { User } from '../../database/mongoose/auth/user.model';
import { CourseModel } from '../../database/mongoose/courses/CourseModel';
import { Admission } from '../../database/mongoose/admission/AdmissionModel';
import { FacultyUserModel as Faculty } from '../../database/mongoose/faculty/faculty.model';
import { PaymentModel } from '../../database/mongoose/financial/financial.model';
import { StudentFinancialInfoModel } from '../../database/mongoose/financial/financial.model';
import { Enquiry } from '../../database/mongoose/enquiry/enquiry.model';
import { NotificationModel } from '../../database/mongoose/notification/notification.model';
import { MessageModel } from '../../database/mongoose/communication/communication.model';
import { Video } from '../../database/mongoose/video/video.model';
import { TeamModel } from '../../database/mongoose/sport/sports.model';
import { Diploma } from '../../database/mongoose/diploma/diploma.model';
import { CampusEventModel } from '../../database/mongoose/events/CampusEventModel';
import { ClubModel } from '../../database/mongoose/clubs/ClubModel';
import { PerformanceRawData, RecentAdmissionRaw, RecentPaymentRaw, RecentEnquiryRaw, RecentNotificationRaw } from '../../../domain/admindashboard/entities/AdminDashboardTypes';

type WithStringId<T> = Omit<T, "_id"> & { _id: string };
type WithStringIdArray<T> = WithStringId<T>[];

export class DashboardRepository implements IDashboardRepository {
  async getDashboardData() {
    const [
      metricsRaw,
      userGrowthRaw,
      revenueRaw,
      performanceRaw,
      activitiesRaw,
      alertsRaw
    ] = await Promise.all([
      this.getDashboardMetrics(),
      this.getUserGrowthData(),
      this.getRevenueData(),
      this.getPerformanceData(),
      this.getRecentActivities(),
      this.getSystemAlerts(),
    ]);
    return {
      metricsRaw,
      userGrowthRaw,
      revenueRaw,
      performanceRaw,
      activitiesRaw,
      alertsRaw
    };
  }

  async getDashboardMetrics() {
    const [totalUsers, totalFaculty, totalCourses, pendingAdmissions, completedPayments] = await Promise.all([
      User.countDocuments({}),
      Faculty.countDocuments({}),
      CourseModel.countDocuments({}),
      Admission.countDocuments({ status: { $regex: '^pending$', $options: 'i' } }),
      PaymentModel.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);
    return {
      totalUsers,
      totalFaculty,
      totalCourses,
      pendingAdmissions,
      completedPayments
    };
  }

  async getUserGrowthData() {
    const end = new Date();
    const start = new Date(end.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const userGrowthRaw = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(start.getTime() + i * 30 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const usersCount = await User.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } });
      const facultyCount = await Faculty.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } });
      userGrowthRaw.push({
        month: months[date.getMonth()],
        usersCount,
        facultyCount
      });
    }
    return userGrowthRaw;
  }

  async getRevenueData() {
    const end = new Date();
    const start = new Date(end.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueRaw = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(start.getTime() + i * 30 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const payments = await PaymentModel.aggregate([
        {
          $match: {
            status: 'Completed',
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: '$method',
            total: { $sum: '$amount' },
          },
        },
      ]);
      revenueRaw.push({
        month: months[date.getMonth()],
        payments
      });
    }
    return revenueRaw;
  }

  async getPerformanceData(): Promise<PerformanceRawData> {
    const [
      userCount,
      facultyCount,
      courseCount,
      admissionCount,
      paymentCount,
      enquiryCount,
      notificationCount,
      communicationCount,
      videoCount,
      sportsCount,
      diplomaCount,
      eventsCount,
      clubsCount
    ] = await Promise.all([
      User.countDocuments({}),
      Faculty.countDocuments({}),
      CourseModel.countDocuments({}),
      Admission.countDocuments({}),
      PaymentModel.countDocuments({ status: 'Completed' }),
      Enquiry.countDocuments({}),
      NotificationModel.countDocuments({}),
      MessageModel.countDocuments({}),
      Video.countDocuments({}),
      TeamModel.countDocuments({}),
      Diploma.countDocuments({}),
      CampusEventModel.countDocuments({}),
      ClubModel.countDocuments({}),
    ]);
    return {
      userCount,
      facultyCount,
      courseCount,
      admissionCount,
      paymentCount,
      enquiryCount,
      notificationCount,
      communicationCount,
      videoCount,
      sportsCount,
      diplomaCount,
      eventsCount,
      clubsCount
    };
  }

  async getRecentActivities() {
    const [recentAdmissions, recentPayments, recentEnquiries, recentNotifications] = await Promise.all([
      Admission.find({}).sort({ createdAt: -1 }).limit(3).populate('registerId', 'firstName lastName email').lean<WithStringIdArray<RecentAdmissionRaw>>({ getters: true }),
      PaymentModel.find({ status: 'Completed' }).sort({ date: -1 }).limit(3).populate('studentId', 'firstName lastName email').lean<WithStringIdArray<RecentPaymentRaw>>({ getters: true }),
      Enquiry.find({ status: 'Completed' }).sort({ createdAt: -1 }).limit(3).lean<WithStringIdArray<RecentEnquiryRaw>>({ getters: true }),
      NotificationModel.find({}).sort({ createdAt: -1 }).limit(3).lean<WithStringIdArray<RecentNotificationRaw>>({ getters: true }),
    ]);
    return {
      recentAdmissions,
      recentPayments,
      recentEnquiries,
      recentNotifications
    };
  }

  async getSystemAlerts() {
    const [pendingAdmissions, failedPayments, overdueCharges, completedPayments] = await Promise.all([
      Admission.countDocuments({ status: 'pending' }),
      PaymentModel.countDocuments({ status: 'Failed' }),
      StudentFinancialInfoModel.countDocuments({ status: 'Pending', paymentDueDate: { $lt: new Date() } }),
      PaymentModel.countDocuments({ status: 'Completed' }),
    ]);
    return {
      pendingAdmissions,
      failedPayments,
      overdueCharges,
      completedPayments
    };
  }

  async refreshDashboard() {
    return await this.getDashboardData();
  }


} 