import mongoose from "mongoose";
import { IFacultyDashboardRepository } from "../../../application/faculty/dashboard/repositories/IFacultyDashboardRepository";
import { VideoSessionModel } from "../../database/mongoose/session/session.model";
import { CourseModel } from "../../database/mongoose/courses/CourseModel";
import { AssignmentModel } from "../../database/mongoose/assignment/AssignmentModel";
import { NotificationModel } from "../../database/mongoose/notification/notification.model";
import { NotificationRecipientType } from "../../../domain/notifications/entities/NotificationTypes";
import { FacultyDashboardMapper } from "./FacultyDashboardMapper";
import {
  DashboardStats,
  FacultyDashboardData,
  WeeklyAttendance,
  AssignmentPerformance,
  SessionDistribution,
  RecentActivity
} from "../../../application/faculty/dtos/FacultyDashboardDTOs";
import { IRecentActivitySource } from "./infraTypes";

export class FacultyDashboardRepository implements IFacultyDashboardRepository {
  async getDashboardStats(facultyId: string): Promise<DashboardStats> {
    if (!mongoose.isValidObjectId(facultyId)) {
      throw new Error("Invalid faculty ID");
    }

    const totalSessions = await VideoSessionModel.countDocuments({
      hostId: facultyId
    });

    const totalAssignments = await AssignmentModel.countDocuments();

    const totalAttendance = await VideoSessionModel.aggregate([
      {
        $match: {
          hostId: facultyId
        }
      },
      {
        $unwind: "$attendance"
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);

    const statsRaw = {
      totalSessions,
      totalAssignments,
      totalAttendance: totalAttendance[0]?.count || 0
    };

    return FacultyDashboardMapper.toStatsDomain(statsRaw);
  }

  async getDashboardData(facultyId: string): Promise<FacultyDashboardData> {
    const [stats, weeklyAttendance, assignmentPerformance, sessionDistribution, recentActivities] = await Promise.all([
      this.getDashboardStats(facultyId),
      this.getWeeklyAttendance(facultyId),
      this.getAssignmentPerformance(facultyId),
      this.getSessionDistribution(facultyId),
      this.getRecentActivities(facultyId)
    ]);

    return {
      stats,
      weeklyAttendance,
      assignmentPerformance,
      sessionDistribution,
      recentActivities
    };
  }

  async getWeeklyAttendance(facultyId: string): Promise<WeeklyAttendance[]> {
    if (!mongoose.isValidObjectId(facultyId)) {
      throw new Error("Invalid faculty ID");
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = await VideoSessionModel.find({
        hostId: facultyId,
        startTime: { $gte: dayStart, $lte: dayEnd }
      }).lean();

      let totalExpectedAttendance = 0;
      let totalActualAttendance = 0;

      daySessions.forEach(session => {
        if (session.maxAttendees) {
          totalExpectedAttendance += session.maxAttendees;
        }
        if (session.attendance && Array.isArray(session.attendance)) {
          const actualAttendance = session.attendance.filter((a) =>
            a.intervals && Array.isArray(a.intervals) && a.intervals.length > 0
          );
          totalActualAttendance += actualAttendance.length;
        }
      });

      const attendancePercentage = totalExpectedAttendance > 0
        ? Math.round((totalActualAttendance / totalExpectedAttendance) * 100)
        : 0;

      weeklyData.push({
        day: days[date.getDay()],
        attendance: attendancePercentage
      });
    }

    return FacultyDashboardMapper.toWeeklyAttendanceDomain(weeklyData);
  }

  async getAssignmentPerformance(facultyId: string): Promise<AssignmentPerformance[]> {
    if (!mongoose.isValidObjectId(facultyId)) {
      throw new Error("Invalid faculty ID");
    }

    const assignmentPerformance = await AssignmentModel.aggregate([
      {
        $match: {
          status: { $in: ['published'] },
        }
      },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'assignmentId',
          as: 'submissions'
        }
      },
      {
        $addFields: {
          totalSubmissions: { $size: '$submissions' },
          averageScore: {
            $cond: {
              if: { $gt: [{ $size: '$submissions' }, 0] },
              then: { $avg: '$submissions.marks' },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          assignment: '$title',
          score: { $round: ['$averageScore', 1] },
          submissions: '$totalSubmissions',
          status: 1
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: 5
      }
    ]);

    let dataToMap = assignmentPerformance;

    if (assignmentPerformance.length === 0) {
      const allAssignmentData = await AssignmentModel.aggregate([
        {
          $lookup: {
            from: 'submissions',
            localField: '_id',
            foreignField: 'assignmentId',
            as: 'submissions'
          }
        },
        {
          $addFields: {
            totalSubmissions: { $size: '$submissions' },
            averageScore: {
              $cond: {
                if: { $gt: [{ $size: '$submissions' }, 0] },
                then: { $avg: '$submissions.marks' },
                else: 0
              }
            }
          }
        },
        {
          $project: {
            assignment: '$title',
            score: { $round: ['$averageScore', 1] },
            submissions: '$totalSubmissions',
            status: 1
          }
        },
        {
          $sort: { score: -1 }
        },
        {
          $limit: 5
        }
      ]);

      dataToMap = allAssignmentData.map(item => ({
        assignment: `${item.assignment} (${item.status})`,
        score: item.score,
        submissions: item.submissions
      }));
    } else {
      dataToMap = assignmentPerformance.map(item => ({
        assignment: item.assignment,
        score: item.score,
        submissions: item.submissions
      }));
    }

    return FacultyDashboardMapper.toAssignmentPerformanceDomain(dataToMap);
  }

  async getSessionDistribution(facultyId: string): Promise<SessionDistribution[]> {
    if (!mongoose.isValidObjectId(facultyId)) {
      throw new Error("Invalid faculty ID");
    }

    const sessionTypes = await VideoSessionModel.aggregate([
      {
        $match: {
          hostId: facultyId
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    const sessionDistribution = sessionTypes.map((type, index) => ({
      name: type._id || 'Unknown',
      value: type.count,
      color: colors[index % colors.length]
    }));

    return FacultyDashboardMapper.toSessionDistributionDomain(sessionDistribution);
  }

  async getRecentActivities(facultyId: string): Promise<RecentActivity[]> {
    if (!mongoose.isValidObjectId(facultyId)) {
      throw new Error("Invalid faculty ID");
    }

    const recentActivitiesRaw: IRecentActivitySource[] = [];

    const recentSessions = await VideoSessionModel.find({ hostId: facultyId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    recentSessions.forEach(session => {
      let message = '';
      let type = 'attendance';

      if (session.status === 'Ended') {
        message = `Session "${session.title}" ended with ${session.attendance?.length || 0} attendees`;
      } else if (session.status === 'Ongoing') {
        message = `Session "${session.title}" is currently active`;
      } else if (session.status === 'Scheduled') {
        message = `Session "${session.title}" scheduled for ${new Date(session.startTime).toLocaleDateString()}`;
        type = 'system';
      } else {
        message = `Session "${session.title}" ${session.status}`;
      }

      recentActivitiesRaw.push({
        id: session._id.toString(),
        type,
        message,
        time: session.createdAt.toISOString()
      });
    });

    const recentCourses = await CourseModel.find({ faculty: facultyId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    recentCourses.forEach(course => {
      recentActivitiesRaw.push({
        id: course._id.toString(),
        type: 'announcement',
        message: `Course "${course.title}" was updated`,
        time: course.updatedAt.toISOString()
      });
    });

    // Add Notifications
    const validRecipientTypes = [
      NotificationRecipientType.ALL,
      NotificationRecipientType.ALL_FACULTY,
      NotificationRecipientType.ALL_STUDENTS_AND_FACULTY
    ];

    const recentNotifications = await NotificationModel.find({
      $or: [
        { recipientId: facultyId },
        { recipientType: { $in: validRecipientTypes } },
      ]
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    recentNotifications.forEach(notification => {
      recentActivitiesRaw.push({
        id: notification._id.toString(),
        type: 'system', // or 'announcement' or mapped from notification.type
        message: notification.title,
        time: notification.createdAt.toISOString()
      });
    });

    recentActivitiesRaw.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    recentActivitiesRaw.splice(10);

    return FacultyDashboardMapper.toRecentActivityDomain(recentActivitiesRaw);
  }
}
