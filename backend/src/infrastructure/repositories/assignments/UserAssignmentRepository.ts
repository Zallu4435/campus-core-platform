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
  async getAssignments(subject?: string, status?: string, page: number = 1, limit: number = 10, search?: string, studentId?: string, sortBy?: string): Promise<{ assignments: Assignment[]; page: number; limit: number; total: number }> {
    const query: mongoose.FilterQuery<IAssignmentSource> = { status: 'published' };

    if (subject && subject !== 'all') {
      query.subject = subject;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    let sort: { [key: string]: mongoose.SortOrder } = { dueDate: 1 };
    if (sortBy === 'priority') sort = { priority: 1 };
    if (sortBy === 'status') sort = { status: 1 };
    if (sortBy === 'subject') sort = { subject: 1 };

    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      AssignmentModel.find(query).sort(sort).skip(skip).limit(limit).lean() as unknown as IAssignmentSource[],
      AssignmentModel.countDocuments(query)
    ]);

    return {
      assignments: docs.map(doc => AssignmentMapper.toDomain(doc)),
      page,
      limit,
      total
    };
  }

  async getAssignmentById(id: string, studentId: string): Promise<{ assignment: Assignment | null; submission: Submission | null }> {
    const [assignmentDoc, submissionDoc] = await Promise.all([
      AssignmentModel.findOne({ _id: id, status: 'published' }).lean() as unknown as IAssignmentSource,
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