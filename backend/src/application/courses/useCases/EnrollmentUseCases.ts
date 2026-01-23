import {
  GetEnrollmentsRequestDTO,
  ApproveEnrollmentRequestDTO,
  RejectEnrollmentRequestDTO,
  GetCourseRequestDetailsRequestDTO,
  GetEnrollmentsResponseDTO,
  GetCourseRequestDetailsResponseDTO,
  SimplifiedEnrollmentDTO,
} from "../dtos/EnrollmentRequestDTOs";
import { ICoursesRepository } from "../repositories/ICoursesRepository";
import {
  CourseNotFoundError,
  EnrollmentNotFoundError,
  InvalidEnrollmentIdError,
} from "../../../domain/courses/errors/CourseErrors";
import { EnrollmentStatus } from "../../../domain/courses/types";
import { EnrollmentDetailsDTO } from "../dtos/EnrollmentRequestDTOs";
import {
  IGetEnrollmentsUseCase,
  IApproveEnrollmentUseCase,
  IRejectEnrollmentUseCase,
  IGetCourseRequestDetailsUseCase
} from "./IEnrollmentUseCases";


export class GetEnrollmentsUseCase implements IGetEnrollmentsUseCase {
  constructor(private readonly _courseRepository: ICoursesRepository) { }

  async execute(params: GetEnrollmentsRequestDTO): Promise<{ success: boolean; data: GetEnrollmentsResponseDTO }> {
    const { enrollments, totalItems, page, limit } = await this._courseRepository.getEnrollments(params);
    const mappedEnrollments: SimplifiedEnrollmentDTO[] = enrollments.map((enrollment) => ({
      id: enrollment.id,
      studentName: enrollment.studentEmail || "Unknown",
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      courseTitle: enrollment.courseTitle || "Unknown Course",
      requestedAt: new Date(enrollment.requestedAt),
      status: enrollment.status as EnrollmentStatus,
      specialization: enrollment.courseSpecialization || "N/A",
      faculty: enrollment.courseFaculty || "N/A",
      term: enrollment.courseTerm || "N/A",
    }));
    return {
      success: true,
      data: {
        data: mappedEnrollments,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }
}

export class ApproveEnrollmentUseCase implements IApproveEnrollmentUseCase {
  constructor(private readonly _courseRepository: ICoursesRepository) { }

  async execute(params: ApproveEnrollmentRequestDTO): Promise<{ success: boolean; data: void }> {
    await this._courseRepository.approveEnrollment(params);

    // Fetch details for notification
    const enrollment = await this._courseRepository.getCourseRequestDetails({ id: params.enrollmentId });
    if (enrollment) {
      await this._courseRepository.sendRequestApprovalNotification(
        'course enrollment',
        params.enrollmentId,
        enrollment.studentId,
        enrollment.courseTitle
      );
    }

    return { success: true, data: undefined };
  }
}

export class RejectEnrollmentUseCase implements IRejectEnrollmentUseCase {
  constructor(private readonly _courseRepository: ICoursesRepository) { }

  async execute(params: RejectEnrollmentRequestDTO): Promise<{ success: boolean; data: void }> {
    await this._courseRepository.rejectEnrollment(params);

    // Fetch details for notification
    const enrollment = await this._courseRepository.getCourseRequestDetails({ id: params.enrollmentId });
    if (enrollment) {
      await this._courseRepository.sendRequestRejectionNotification(
        'course enrollment',
        params.enrollmentId,
        enrollment.studentId,
        enrollment.courseTitle
      );
    }

    return { success: true, data: undefined };
  }
}

export class GetCourseRequestDetailsUseCase implements IGetCourseRequestDetailsUseCase {
  constructor(private readonly _courseRepository: ICoursesRepository) { }

  async execute(params: GetCourseRequestDetailsRequestDTO): Promise<{ success: boolean; data: GetCourseRequestDetailsResponseDTO | null }> {
    if (!params.id) {
      throw new InvalidEnrollmentIdError();
    }
    const enrollment: EnrollmentDetailsDTO | null = await this._courseRepository.getCourseRequestDetails(params);
    if (!enrollment) {
      throw new EnrollmentNotFoundError(params.id);
    }

    return {
      success: true,
      data: {
        courseRequest: {
          id: enrollment.id,
          status: enrollment.status,
          createdAt: enrollment.createdAt.toISOString(),
          updatedAt: enrollment.updatedAt?.toISOString() || new Date().toISOString(),
          reason: enrollment.reason || "No reason provided",
          course: {
            id: enrollment.courseId,
            title: enrollment.courseTitle,
            specialization: enrollment.courseSpecialization || "",
            term: enrollment.courseTerm || "",
            faculty: enrollment.courseFaculty || "",
            credits: enrollment.courseCredits || 0,
          },
          user: {
            id: enrollment.studentId,
            name: `${enrollment.studentFirstName} ${enrollment.studentLastName || ''}`.trim(),
            email: enrollment.studentEmail,
          },
        },
      },
    };
  }
} 