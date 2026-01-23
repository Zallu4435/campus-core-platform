import { Student } from "../../../domain/academics/entities/Student";
import { Grade } from "../../../domain/academics/entities/Grade";
import { Course } from "../../../domain/academics/entities/Course";
import { AcademicHistory } from "../../../domain/academics/entities/AcademicHistory";
import { Program } from "../../../domain/academics/entities/Program";
import { Progress } from "../../../domain/academics/entities/Progress";
import { Requirement } from "../../../domain/academics/entities/Requirement";
import { Enrollment } from "../../../domain/academics/entities/Enrollment";
import { TranscriptRequest } from "../../../domain/academics/entities/TranscriptRequest";
import {
  StudentInfoResult,
  CourseFilter,
  AcademicHistoryFilter,
  TranscriptRequestInput
} from "./AcademicRepositoryTypes";

export interface IAcademicRepository {
  findStudentById(userId: string): Promise<StudentInfoResult | null>;
  findGradeByUserId(userId: string): Promise<Grade | null>;
  findAllCourses(search?: string, page?: number, limit?: number): Promise<Course[]>;
  findAcademicHistory(userId: string, startTerm?: string, endTerm?: string): Promise<AcademicHistory[]>;
  findProgramByUserId(userId: string): Promise<Program | null>;
  findProgressByUserId(userId: string): Promise<Progress | null>;
  findRequirementsByUserId(userId: string): Promise<Requirement | null>;
  findCourseById(courseId: string): Promise<Course | null>;
  findEnrollment(studentId: string, courseId: string): Promise<Enrollment | null>;

  createEnrollment(studentId: string, courseId: string, reason?: string): Promise<Enrollment>;
  updateCourseEnrollment(courseId: string, increment: number): Promise<Course | null>;
  deleteEnrollment(studentId: string, courseId: string): Promise<boolean>;

  createTranscriptRequest(request: TranscriptRequestInput): Promise<TranscriptRequest>;
}