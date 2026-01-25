import {
  GetCoursesRequestDTO,
  CreateCourseRequestDTO,
  UpdateCourseRequestDTO,
  DeleteCourseRequestDTO,
} from "../dtos/CourseRequestDTOs";
import {
  GetEnrollmentsRequestDTO,
  ApproveEnrollmentRequestDTO,
  RejectEnrollmentRequestDTO,
  GetCourseRequestDetailsRequestDTO,
  EnrollmentDetailsDTO,
} from "../dtos/EnrollmentRequestDTOs";
import { IBaseRepository } from "../../repositories/IBaseRepository";
import { ICourseDocument } from "../../../infrastructure/repositories/courses/infraTypes";
import { CourseSummaryDTO } from "../dtos/CourseResponseDTOs";
import { Course } from "../../../domain/courses/entities/Course";

export interface ICoursesRepository extends IBaseRepository<ICourseDocument, CreateCourseRequestDTO, UpdateCourseRequestDTO, Record<string, unknown>, ICourseDocument> {
  getCourses(params: GetCoursesRequestDTO): Promise<{ courses: CourseSummaryDTO[]; totalItems: number; page: number; limit: number }>;
  getCourseById(id: string): Promise<Course | null>;
  createCourse(params: CreateCourseRequestDTO): Promise<Course>;
  updateCourse(params: UpdateCourseRequestDTO): Promise<Course | null>;
  deleteCourse(params: DeleteCourseRequestDTO): Promise<void>;
  getEnrollments(params: GetEnrollmentsRequestDTO): Promise<{ enrollments: EnrollmentDetailsDTO[]; totalItems: number; page: number; limit: number }>;
  approveEnrollment(params: ApproveEnrollmentRequestDTO): Promise<void>;
  rejectEnrollment(params: RejectEnrollmentRequestDTO): Promise<void>;
  getCourseRequestDetails(params: GetCourseRequestDetailsRequestDTO): Promise<EnrollmentDetailsDTO | null>;
}