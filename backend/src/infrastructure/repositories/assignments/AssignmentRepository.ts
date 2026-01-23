import { IAssignmentRepository } from '../../../application/assignments/repositories/IAssignmentRepository';
import { AssignmentModel } from '../../database/mongoose/assignment/AssignmentModel';
import { SubmissionModel } from '../../database/mongoose/assignment/SubmissionModel';
import { Assignment } from '../../../domain/assignments/entities/Assignment';
import { Submission } from '../../../domain/assignments/entities/Submission';
import { AssignmentMapper } from './mappers/AssignmentMapper';
import { AnalyticsData } from '../../../application/assignments/dtos/AnalyticsDTOs';
import mongoose from 'mongoose';

import { IAssignmentDocument } from '../../database/mongoose/assignment/AssignmentModel';
import { ISubmissionDocument } from '../../database/mongoose/assignment/SubmissionModel';
import { FilterQuery } from 'mongoose';

export class AssignmentRepository implements IAssignmentRepository {
  async getAssignments(subject?: string, status?: string, page: number = 1, limit: number = 10, search?: string) {
    const query: FilterQuery<IAssignmentDocument> = {};
    if (subject) query.subject = subject;
    if (status) query.status = status;
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      AssignmentModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      AssignmentModel.countDocuments(query)
    ]);

    return {
      assignments: docs.map(doc => AssignmentMapper.toDomain(doc)),
      total,
      page,
      limit
    };
  }

  async getAssignmentById(id: string): Promise<Assignment | null> {
    const doc = await AssignmentModel.findById(id);
    return doc ? AssignmentMapper.toDomain(doc) : null;
  }

  async getSubmissionsStats(assignmentIds: string[]) {
    const objectIds = assignmentIds.map(id => new mongoose.Types.ObjectId(id));

    const submissionsAggregation = await SubmissionModel.aggregate([
      { $match: { assignmentId: { $in: objectIds } } },
      {
        $group: {
          _id: '$assignmentId',
          totalSubmissions: { $sum: 1 },
          totalMarks: { $sum: { $cond: [{ $isNumber: '$marks' }, '$marks', 0] } },
          gradedSubmissions: { $sum: { $cond: [{ $isNumber: '$marks' }, 1, 0] } }
        }
      },
      {
        $addFields: {
          _id: { $toString: '$_id' }
        }
      }
    ]);

    return submissionsAggregation;
  }

  async createAssignment(assignment: Assignment): Promise<Assignment> {
    const persistence = AssignmentMapper.toPersistence(assignment);
    const doc = await AssignmentModel.create(persistence);
    return AssignmentMapper.toDomain(doc);
  }

  async updateAssignment(id: string, assignment: Partial<Assignment>): Promise<Assignment | null> {
    const doc = await AssignmentModel.findByIdAndUpdate(
      id,
      { $set: assignment },
      { new: true }
    );
    return doc ? AssignmentMapper.toDomain(doc) : null;
  }

  async deleteAssignment(id: string): Promise<boolean> {
    const result = await AssignmentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getSubmissions(assignmentId: string, page: number = 1, limit: number = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const filterQuery: FilterQuery<ISubmissionDocument> = { assignmentId: new mongoose.Types.ObjectId(assignmentId) };

    if (status) {
      filterQuery.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filterQuery.$or = [
        { studentName: searchRegex },
        { feedback: searchRegex },
        { 'files.fileName': searchRegex }
      ];
    }

    const [docs, total] = await Promise.all([
      SubmissionModel.find(filterQuery)
        .skip(skip)
        .limit(limit)
        .sort({ submittedDate: -1 }),
      SubmissionModel.countDocuments(filterQuery)
    ]);

    return {
      submissions: docs.map(doc => AssignmentMapper.submissionToDomain(doc)),
      total,
      page,
      limit
    };
  }

  async getSubmissionById(assignmentId: string, submissionId: string): Promise<Submission | null> {
    const doc = await SubmissionModel.findOne({
      _id: submissionId,
      assignmentId
    });
    return doc ? AssignmentMapper.submissionToDomain(doc) : null;
  }

  async reviewSubmission(assignmentId: string, submissionId: string, marks: number, feedback: string, status: string, isLate: boolean): Promise<Submission | null> {
    const doc = await SubmissionModel.findOneAndUpdate(
      { _id: submissionId, assignmentId },
      {
        $set: {
          marks,
          feedback,
          status,
          isLate,
          reviewedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    return doc ? AssignmentMapper.submissionToDomain(doc) : null;
  }

  async getAnalytics(): Promise<AnalyticsData> {
    const totalAssignments = await AssignmentModel.countDocuments();
    const totalSubmissions = await SubmissionModel.countDocuments();
    const submissionRate = totalAssignments > 0 ? Math.min(totalSubmissions / totalAssignments, 1) : 0;

    const [submissions, assignments] = await Promise.all([
      SubmissionModel.find().lean(),
      AssignmentModel.find().lean()
    ]);

    let totalHours = 0;
    let countWithTime = 0;
    const assignmentMap = new Map<string, IAssignmentDocument>(assignments.map(a => [a._id.toString(), a]));

    for (const sub of submissions) {
      const assignment = assignmentMap.get(sub.assignmentId.toString());
      if (assignment && assignment.createdAt && sub.submittedDate) {
        const hours = (new Date(sub.submittedDate).getTime() - new Date(assignment.createdAt).getTime()) / (1000 * 60 * 60);
        totalHours += hours;
        countWithTime++;
      }
    }
    const averageSubmissionTimeHours = countWithTime > 0 ? totalHours / countWithTime : 0;

    const subjectDistribution: Record<string, number> = {};
    for (const a of assignments) {
      subjectDistribution[a.subject] = (subjectDistribution[a.subject] || 0) + 1;
    }

    const statusDistribution: Record<string, number> = {};
    for (const s of submissions) {
      statusDistribution[s.status] = (statusDistribution[s.status] || 0) + 1;
    }

    const recentSubmissionsDocs = await SubmissionModel.find().sort({ submittedDate: -1 }).limit(5).lean<ISubmissionDocument[]>();
    const recentSubmissions = recentSubmissionsDocs.map(s => ({
      assignmentTitle: assignmentMap.get(s.assignmentId.toString())?.title || '',
      studentName: s.studentName,
      submittedAt: s.submittedDate,
      score: s.marks || 0
    }));

    const studentScores: Record<string, { studentName: string; totalScore: number; count: number }> = {};
    for (const s of submissions) {
      if (!studentScores[s.studentId.toString()]) {
        studentScores[s.studentId.toString()] = { studentName: s.studentName, totalScore: 0, count: 0 };
      }
      if (typeof s.marks === 'number') {
        studentScores[s.studentId.toString()].totalScore += s.marks;
        studentScores[s.studentId.toString()].count++;
      }
    }
    const topPerformers = Object.entries(studentScores)
      .filter(([_, v]) => v.count > 0)
      .map(([studentId, v]) => ({
        studentId,
        studentName: v.studentName,
        averageScore: v.totalScore / v.count,
        submissionsCount: v.count
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    return {
      totalAssignments,
      totalSubmissions,
      submissionRate,
      averageSubmissionTimeHours,
      subjectDistribution,
      statusDistribution,
      recentSubmissions,
      topPerformers
    };
  }
}