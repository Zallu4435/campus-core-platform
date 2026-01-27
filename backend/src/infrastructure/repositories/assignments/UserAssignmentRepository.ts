import { IUserAssignmentRepository } from '../../../application/assignments/repositories/IUserAssignmentRepository';
import { FileDTO } from '../../../application/assignments/dtos/AssignmentDTOs';
import { AssignmentModel } from '../../database/mongoose/assignment/AssignmentModel';
import { SubmissionModel } from '../../database/mongoose/assignment/SubmissionModel';
import { AssignmentMapper } from './mappers/AssignmentMapper';
import { Assignment } from '../../../domain/assignments/entities/Assignment';
import { Submission } from '../../../domain/assignments/entities/Submission';
import mongoose from 'mongoose';

import { IAssignmentSource, ISubmissionSource } from './infraTypes';

export class UserAssignmentRepository implements IUserAssignmentRepository {
  async getAssignments(subject?: string, status?: string, page: number = 1, limit: number = 10, search?: string, studentId?: string, sortBy?: string): Promise<{ assignments: { assignment: Assignment; submission: Submission | null }[]; page: number; limit: number; total: number }> {
    let query: mongoose.FilterQuery<IAssignmentSource> = {};

    // 1. Handle Status Filtering Logic
    if (status === 'all' || !status) {
      // Show both published and draft (or whatever the user wants to see)
      query.status = { $in: ['published', 'draft'] };
    } else if (status === 'submitted' || status === 'graded' || status === 'needs_correction') {
      // These are submission-based statuses. 
      // First, get the assignment IDs that the student has submitted with this status.
      const submissionQuery: any = { studentId };
      if (status === 'graded') submissionQuery.status = 'reviewed';
      else if (status === 'submitted') submissionQuery.status = { $in: ['pending', 'reviewed', 'late'] };
      else if (status === 'needs_correction') submissionQuery.status = 'needs_correction';

      const studentSubmissions = await SubmissionModel.find(submissionQuery).lean() as unknown as ISubmissionSource[];
      const assignmentIds = studentSubmissions.map(s => s.assignmentId);

      query._id = { $in: assignmentIds };
    } else {
      // Standard status filter (e.g., 'published', 'draft')
      query.status = status;
    }

    // 2. Add Subject and Search filters
    if (subject && subject !== 'all') {
      query.subject = subject;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    // 3. Sorting and Pagination
    let sort: { [key: string]: mongoose.SortOrder } = { dueDate: 1 };
    if (sortBy === 'priority') sort = { priority: 1 };
    if (sortBy === 'status') sort = { status: 1 };
    if (sortBy === 'subject') sort = { subject: 1 };

    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      AssignmentModel.find(query).sort(sort).skip(skip).limit(limit).lean() as unknown as IAssignmentSource[],
      AssignmentModel.countDocuments(query)
    ]);

    // 4. Fetch submissions for the found assignments to attach to the response
    let submissions: ISubmissionSource[] = [];
    if (studentId) {
      const assignmentIds = docs.map(doc => doc._id);
      submissions = await SubmissionModel.find({
        assignmentId: { $in: assignmentIds },
        studentId: studentId
      }).lean() as unknown as ISubmissionSource[];
    }

    const mappedResults = docs.map(doc => {
      const assignment = AssignmentMapper.toDomain(doc);
      const submissionDoc = submissions.find(s => s.assignmentId.toString() === doc._id.toString());
      const submission = submissionDoc ? AssignmentMapper.submissionToDomain(submissionDoc) : null;
      return { assignment, submission };
    });

    return {
      assignments: mappedResults,
      page,
      limit,
      total
    };
  }

  async getAssignmentById(id: string, studentId: string): Promise<{ assignment: Assignment | null; submission: Submission | null }> {
    const [assignmentDoc, submissionDoc] = await Promise.all([
      AssignmentModel.findOne({ _id: id, status: { $in: ['published', 'draft'] } }).lean() as unknown as IAssignmentSource,
      SubmissionModel.findOne({ assignmentId: id, studentId }).lean() as unknown as ISubmissionSource
    ]);

    return {
      assignment: assignmentDoc ? AssignmentMapper.toDomain(assignmentDoc) : null,
      submission: submissionDoc ? AssignmentMapper.submissionToDomain(submissionDoc) : null
    };
  }

  async submitAssignment(assignmentId: string, files: FileDTO[], studentId: string): Promise<Submission> {
    const User = mongoose.model('User');
    const student = await User.findById(studentId).lean<{ firstName: string; lastName: string }>();

    const submissionData = {
      assignmentId: new mongoose.Types.ObjectId(assignmentId),
      studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : '',
      files: files.map((file) => ({
        fileName: file.originalname,
        fileUrl: file.path,
        fileSize: file.size
      })),
      submittedDate: new Date(),
      status: 'pending',
      isLate: false
    };

    const doc = await SubmissionModel.findOneAndUpdate(
      { assignmentId, studentId },
      { $set: submissionData },
      { new: true, upsert: true }
    ).lean() as unknown as ISubmissionSource;

    return AssignmentMapper.submissionToDomain(doc);
  }

  async getAssignmentStatus(assignmentId: string, studentId: string): Promise<Submission | null> {
    const doc = await SubmissionModel.findOne({ studentId, assignmentId }).lean() as unknown as ISubmissionSource;
    return doc ? AssignmentMapper.submissionToDomain(doc) : null;
  }

  async getAssignmentFeedback(assignmentId: string, studentId: string): Promise<Submission | null> {
    const doc = await SubmissionModel.findOne({ studentId, assignmentId, status: 'reviewed' }).lean() as unknown as ISubmissionSource;
    return doc ? AssignmentMapper.submissionToDomain(doc) : null;
  }
}