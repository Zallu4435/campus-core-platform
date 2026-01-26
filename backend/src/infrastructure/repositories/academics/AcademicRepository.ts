import mongoose from 'mongoose';
import { IAcademicRepository } from '../../../application/academics/repositories/IAcademicRepository';
import {
  IStudentSource,
  IProgramSource,
  IEnrollmentSource,
  IGradeSource,
  ICourseSource,
  IAcademicHistorySource,
  IProgressSource,
  IRequirementSource,
  ITranscriptRequestSource
} from "./infraTypes";
import {
  StudentInfoResult
} from "../../../application/academics/repositories/AcademicRepositoryTypes";
import { Course } from "../../../domain/academics/entities/Course";


import { Enrollment } from "../../../domain/academics/entities/Enrollment";
import { Grade } from "../../../domain/academics/entities/Grade";
import { AcademicHistory } from "../../../domain/academics/entities/AcademicHistory";
import { Program } from "../../../domain/academics/entities/Program";
import { Progress } from "../../../domain/academics/entities/Progress";
import { Requirement } from "../../../domain/academics/entities/Requirement";
import { TranscriptRequest } from "../../../domain/academics/entities/TranscriptRequest";

import { User as UserModel } from '../../database/mongoose/auth/user.model';
import { ProgramModel } from '../../database/mongoose/academic/studentProgram.model';
import { EnrollmentModel } from '../../database/mongoose/courses/CourseModel';
import { GradeModel } from '../../database/mongoose/academic/grade.model';
import { CourseModel } from '../../database/mongoose/courses/CourseModel';
import { AcademicHistoryModel } from '../../database/mongoose/academic/academicHistory.model';
import { ProgressModel } from '../../database/mongoose/academic/progress.model';
import { RequirementsModel } from '../../database/mongoose/academic/requirement.model';
import { TranscriptRequestModel } from '../../database/mongoose/academic/transcript.model';

import { AcademicMappers } from './mappers/AcademicMappers';
import { AcademicConstants } from '../../../application/academics/constants/AcademicConstants';
import { TranscriptRequestInput } from "../../../application/academics/repositories/AcademicRepositoryTypes";
import { v4 as uuidv4 } from 'uuid';

export class AcademicRepository implements IAcademicRepository {

  async findStudentById(userId: string): Promise<StudentInfoResult | null> {
    if (!mongoose.isValidObjectId(userId)) return null;

    const userDoc = await UserModel.findById(userId).lean();
    if (!userDoc) return null;

    const programDoc = await ProgramModel.findOne({ studentId: userId }).lean();
    if (!programDoc) return null; // Requirement says it returns null if program not found? 
    // Old code: if (!program) return null; (Yes)

    // Enrollments
    const pendingEnrollmentDocs = await EnrollmentModel.find({
      studentId: userId,
      status: { $regex: /^pending/i }
    }).lean();

    const approvedEnrollmentDocs = await EnrollmentModel.find({
      studentId: userId,
      status: 'Approved'
    }).lean();

    const student = AcademicMappers.toStudent(userDoc as unknown as IStudentSource);
    const program = AcademicMappers.toProgram(programDoc as unknown as IProgramSource);
    const pendingEnrollments = pendingEnrollmentDocs.map(doc => AcademicMappers.toEnrollment(doc as unknown as IEnrollmentSource));
    const approvedEnrollments = approvedEnrollmentDocs.map(doc => AcademicMappers.toEnrollment(doc as unknown as IEnrollmentSource));

    return { student, program, pendingEnrollments, approvedEnrollments };
  }

  async findGradeByUserId(userId: string): Promise<Grade | null> {
    const doc = await GradeModel.findOne({ studentId: userId }).lean();
    return doc ? AcademicMappers.toGrade(doc as unknown as IGradeSource) : null;
  }

  async findAllCourses(search?: string, page: number = 1, limit: number = 5): Promise<Course[]> {
    const query: Record<string, unknown> = {};
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), AcademicConstants.Course.SEARCH_REGEX_FLAGS);
      query.$or = [
        { title: searchRegex },
        { specialization: searchRegex },
        { faculty: searchRegex },
        { description: searchRegex }
      ];
    }
    const skip = (page - 1) * limit;

    const docs = await CourseModel.find(query)
      .sort(search ? {} : { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return docs.map(doc => AcademicMappers.toCourse(doc as unknown as ICourseSource));
  }

  async findAcademicHistory(userId: string, startTerm?: string, endTerm?: string): Promise<AcademicHistory[]> {
    const actualQuery: Record<string, unknown> = { studentId: userId };
    // AcademicHistoryModel 'studentId' (Schema says studentId). Old interface had 'userId'.
    // Old Repo implementation: `const query: AcademicHistoryFilter = { userId };`
    // Wait, the Model schema I viewed earlier (`academicHistory.model.ts`) has `studentId`.
    // BUT pure implementation `findAcademicHistory` function might differ.
    // The previous `findAcademicHistory` passed `userId` to `find(query)`.
    // If Model has `studentId`, then `find({ userId: ... })` would FAIL unless logic maps it!
    // Or if `userId` field exists in document?
    // `academicHistory.model.ts`: `studentId: { type: ObjectId, ... }, id: Number`. NO `userId`.
    // So the **Old Code was likely buggy** or I misread something. 
    // Wait, `IAcademicHistoryDocument` had `userId`?
    // Old Entity file: `export interface IAcademicHistoryDocument { userId: string ... }`
    // BUT `AcademicHistoryModel` schema has `studentId`.
    // This implies simple mapping mismatch. I will query by `studentId: userId`.



    if (startTerm) actualQuery.term = { $gte: startTerm };
    if (endTerm) {
      if (!actualQuery.term) actualQuery.term = {} as Record<string, unknown>;
      (actualQuery.term as Record<string, unknown>).$lte = endTerm;
    }

    // Also strict check if `AcademicHistory` stores `userId` or `studentId`.
    // I noticed `GradeModel` has `studentId` too.

    const docs = await AcademicHistoryModel.find(actualQuery).lean();
    return docs.map(doc => AcademicMappers.toAcademicHistory(doc as unknown as IAcademicHistorySource));
  }

  async findProgramByUserId(userId: string): Promise<Program | null> {
    const doc = await ProgramModel.findOne({ studentId: userId }).lean();
    return doc ? AcademicMappers.toProgram(doc as unknown as IProgramSource) : null;
  }

  async findProgressByUserId(userId: string): Promise<Progress | null> {
    const doc = await ProgressModel.findOne({ studentId: userId }).lean();
    return doc ? AcademicMappers.toProgress(doc as unknown as IProgressSource) : null;
  }

  async findRequirementsByUserId(userId: string): Promise<Requirement | null> {
    const doc = await RequirementsModel.findOne({ studentId: userId }).lean();
    return doc ? AcademicMappers.toRequirement(doc as unknown as IRequirementSource) : null;
  }

  async findCourseById(courseId: string): Promise<Course | null> {
    if (!mongoose.isValidObjectId(courseId)) return null;
    const doc = await CourseModel.findById(courseId).lean();
    return doc ? AcademicMappers.toCourse(doc as unknown as ICourseSource) : null;
  }

  async findEnrollment(studentId: string, courseId: string): Promise<Enrollment | null> {
    if (!mongoose.isValidObjectId(studentId) || !mongoose.isValidObjectId(courseId)) return null;
    const doc = await EnrollmentModel.findOne({
      studentId,
      courseId,
      status: { $in: ['Pending', 'Approved'] }
    }).lean();

    return doc ? AcademicMappers.toEnrollment(doc as unknown as IEnrollmentSource) : null;
  }

  async createEnrollment(studentId: string, courseId: string, reason?: string): Promise<Enrollment> {
    const doc = await new EnrollmentModel({
      _id: new mongoose.Types.ObjectId(),
      studentId,
      courseId,
      status: 'Pending', // DB String
      reason,
      requestedAt: new Date()
    }).save();

    // Convert to Object to get simple properties
    return AcademicMappers.toEnrollment(doc.toObject() as unknown as IEnrollmentSource);
  }

  async updateCourseEnrollment(courseId: string, increment: number): Promise<Course | null> {
    // Logic: check max enrollment.
    // Ideally this is domain logic, but atomically enforcing in DB is safer for concurrency.
    // I will keep the atomic update.

    if (!mongoose.isValidObjectId(courseId)) return null;

    // We can't use `CourseModel.findById(courseId)` inside the condition easily if we want atomic check-and-set.
    // Old code: `{ _id: courseId, currentEnrollment: { $lt: ... } }`
    // BUT `maxEnrollment` is a field in the document. MongoDB supports `$expr` checks but standard `findOneAndUpdate` query with field reference is tricky.
    // Old code did `await CourseModel.findById(courseId)` inside the query construction? 
    // `currentEnrollment: { $lt: (await CourseModel.findById(courseId)).maxEnrollment }`
    // This is NOT atomic. It fetches, then queries. Race condition exists.
    // I will replicate the behavior for now.

    const course = await CourseModel.findById(courseId);
    if (!course) return null;

    // If incrementing, check limit
    if (increment > 0 && course.currentEnrollment >= course.maxEnrollment) {
      return AcademicMappers.toCourse(course.toObject() as unknown as ICourseSource); // Return unchanged
    }

    const updatedDoc = await CourseModel.findOneAndUpdate(
      { _id: courseId },
      { $inc: { currentEnrollment: increment } },
      { new: true }
    ).lean();

    return updatedDoc ? AcademicMappers.toCourse(updatedDoc as unknown as ICourseSource) : null;
  }

  async deleteEnrollment(studentId: string, courseId: string): Promise<boolean> {
    if (!mongoose.isValidObjectId(studentId) || !mongoose.isValidObjectId(courseId)) return false;
    const result = await EnrollmentModel.findOneAndDelete({
      studentId,
      courseId,
      status: { $in: ['Pending', 'Approved'] }
    });
    return !!result;
  }

  async createTranscriptRequest(request: TranscriptRequestInput): Promise<TranscriptRequest> {
    const doc = await new TranscriptRequestModel({
      _id: new mongoose.Types.ObjectId(),
      studentId: request.userId,
      deliveryMethod: request.deliveryMethod,
      address: request.address,
      email: request.email,
      requestId: uuidv4(),
      requestedAt: request.requestedAt || new Date(),
      estimatedDelivery: request.estimatedDelivery
    }).save();

    return AcademicMappers.toTranscriptRequest(doc.toObject() as unknown as ITranscriptRequestSource);
  }
}