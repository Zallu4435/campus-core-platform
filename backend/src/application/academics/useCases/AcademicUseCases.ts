import {
  GetStudentInfoRequestDTO,
  GetStudentInfoResponseDTO,
  GetGradeInfoRequestDTO,
  GetGradeInfoResponseDTO,
  GetCoursesRequestDTO,
  GetCoursesResponseDTO,
  GetAcademicHistoryRequestDTO,
  GetAcademicHistoryResponseDTO,
  GetProgramInfoRequestDTO,
  GetProgramInfoResponseDTO,
  GetProgressInfoRequestDTO,
  GetProgressInfoResponseDTO,
  GetRequirementsInfoRequestDTO,
  GetRequirementsInfoResponseDTO,
  RegisterCourseRequestDTO,
  RegisterCourseResponseDTO,
  DropCourseRequestDTO,
  DropCourseResponseDTO,
  RequestTranscriptRequestDTO,
  RequestTranscriptResponseDTO,
  ResponseDTO,
  CourseWithJoined,
  AcademicHistoryDTO
} from "../../../application/academics/dtos/AcademicDTOs";
import { IAcademicRepository } from "../repositories/IAcademicRepository";
import {
  IGetStudentInfoUseCase,
  IGetGradeInfoUseCase,
  IGetCoursesUseCase,
  IGetAcademicHistoryUseCase,
  IGetProgramInfoUseCase,
  IGetProgressInfoUseCase,
  IGetRequirementsInfoUseCase,
  IRegisterCourseUseCase,
  IDropCourseUseCase,
  IRequestTranscriptUseCase
} from "./IAcademicUseCases";
import { AcademicConstants } from "../constants/AcademicConstants";
import {
  StudentNotFoundError,
  GradeNotFoundError,
  CourseNotFoundError,
  ProgramNotFoundError,
  ProgressNotFoundError,
  RequirementsNotFoundError,
  AlreadyEnrolledError,
  NotEnrolledError,
  EnrollmentFailedError
} from "../../../domain/academics/errors/AcademicErrors";

export class GetStudentInfoUseCase implements IGetStudentInfoUseCase {
  constructor(private _academicRepository: IAcademicRepository) { }

  async execute(input: GetStudentInfoRequestDTO): Promise<ResponseDTO<GetStudentInfoResponseDTO>> {
    const result = await this._academicRepository.findStudentById(input.userId);
    if (!result) {
      throw new StudentNotFoundError(input.userId);
    }
    const { student, program, pendingEnrollments } = result;

    const pendingCreditsPromises = pendingEnrollments.map(async (enrollment) => {
      const course = await this._academicRepository.findCourseById(enrollment.courseId);
      return course ? course.credits : 0;
    });

    const pendingCredits = (await Promise.all(pendingCreditsPromises)).reduce((sum, c) => sum + c, 0);

    const response: GetStudentInfoResponseDTO = {
      name: student.fullName,
      id: student.id,
      email: student.email,
      phone: student.phone,
      profilePicture: student.profilePicture,
      major: program.degree,
      catalogYear: program.catalogYear,
      academicStanding: 'Good',
      advisor: 'Unknown',
      pendingCredits,
      credits: program.credits
    };
    return { data: response, success: true };
  }
}

export class GetGradeInfoUseCase implements IGetGradeInfoUseCase {
  constructor(private _academicRepository: IAcademicRepository) { }

  async execute(input: GetGradeInfoRequestDTO): Promise<ResponseDTO<GetGradeInfoResponseDTO>> {
    const grade = await this._academicRepository.findGradeByUserId(input.userId);
    if (!grade) {
      throw new GradeNotFoundError(input.userId);
    }
    const response: GetGradeInfoResponseDTO = {
      cumulativeGPA: grade.cumulativeGPA,
      termGPA: grade.termGPA,
      termName: grade.termName,
      creditsEarned: grade.creditsEarned,
      creditsInProgress: grade.creditsInProgress
    };
    return { data: response, success: true };
  }
}

export class GetCoursesUseCase implements IGetCoursesUseCase {
  constructor(private _academicRepository: IAcademicRepository) { }

  async execute(input: GetCoursesRequestDTO & { userId?: string }): Promise<ResponseDTO<GetCoursesResponseDTO>> {
    const { search, page = AcademicConstants.Course.DEFAULT_PAGE, limit = AcademicConstants.Course.DEFAULT_LIMIT, userId } = input;

    const safeLimit = Math.min(limit, AcademicConstants.Course.MAX_LIMIT);

    const courses = await this._academicRepository.findAllCourses(search, page, safeLimit);

    const mappedCourses: CourseWithJoined[] = await Promise.all(courses.map(async (course) => {
      let joined = false;
      if (userId) {
        const enrollment = await this._academicRepository.findEnrollment(userId, course.id);
        joined = !!enrollment;
      }
      return {
        id: course.id,
        title: course.title,
        specialization: course.specialization,
        faculty: course.faculty,
        credits: course.credits,
        term: course.term,
        maxEnrollment: course.maxEnrollment,
        currentEnrollment: course.currentEnrollment,
        createdAt: course.createdAt.toISOString(),
        schedule: course.schedule,
        description: course.description,
        prerequisites: course.prerequisites,
        joined
      };
    }));

    const response: GetCoursesResponseDTO = {
      courses: mappedCourses,
      totalCourses: mappedCourses.length,
      totalPages: 1,
      currentPage: page
    };
    return { data: response, success: true };
  }
}

export class GetAcademicHistoryUseCase implements IGetAcademicHistoryUseCase {
  constructor(private _academicRepository: IAcademicRepository) { }

  async execute(input: GetAcademicHistoryRequestDTO): Promise<ResponseDTO<GetAcademicHistoryResponseDTO>> {
    const history = await this._academicRepository.findAcademicHistory(input.userId, input.startTerm, input.endTerm);
    const mappedHistory: AcademicHistoryDTO[] = history.map(record => ({
      term: record.term,
      credits: record.credits,
      gpa: record.gpa,
      id: Number(record.id)
    }));

    return { data: { history: mappedHistory }, success: true };
  }
}

export class GetProgramInfoUseCase implements IGetProgramInfoUseCase {
  constructor(private _academicRepository: IAcademicRepository) { }

  async execute(input: GetProgramInfoRequestDTO): Promise<ResponseDTO<GetProgramInfoResponseDTO>> {
    const program = await this._academicRepository.findProgramByUserId(input.userId);
    if (!program) {
      throw new ProgramNotFoundError(input.userId);
    }
    return {
      data: {
        degree: program.degree,
        catalogYear: program.catalogYear
      },
      success: true
    };
  }
}

export class GetProgressInfoUseCase implements IGetProgressInfoUseCase {
  constructor(private _academicRepository: IAcademicRepository) { }

  async execute(input: GetProgressInfoRequestDTO): Promise<ResponseDTO<GetProgressInfoResponseDTO>> {
    const progress = await this._academicRepository.findProgressByUserId(input.userId);
    if (!progress) {
      throw new ProgressNotFoundError(input.userId);
    }
    return {
      data: {
        overallProgress: progress.overallProgress,
        totalCredits: progress.totalCredits,
        completedCredits: progress.completedCredits,
        remainingCredits: progress.remainingCredits,
        estimatedGraduation: progress.estimatedGraduation
      },
      success: true
    };
  }
}

export class GetRequirementsInfoUseCase implements IGetRequirementsInfoUseCase {
  constructor(private _academicRepository: IAcademicRepository) { }

  async execute(input: GetRequirementsInfoRequestDTO): Promise<ResponseDTO<GetRequirementsInfoResponseDTO>> {
    const requirements = await this._academicRepository.findRequirementsByUserId(input.userId);
    if (!requirements) {
      throw new RequirementsNotFoundError(input.userId);
    }
    return {
      data: {
        core: requirements.core,
        elective: requirements.elective,
        general: requirements.general
      },
      success: true
    };
  }
}

export class RegisterCourseUseCase implements IRegisterCourseUseCase {
  constructor(private _academicRepository: IAcademicRepository) { }

  async execute(input: RegisterCourseRequestDTO): Promise<ResponseDTO<RegisterCourseResponseDTO>> {
    const course = await this._academicRepository.findCourseById(input.courseId);
    if (!course) {
      throw new CourseNotFoundError(input.courseId);
    }

    const existingEnrollment = await this._academicRepository.findEnrollment(input.studentId, input.courseId);
    if (existingEnrollment) {
      throw new AlreadyEnrolledError();
    }

    const enrollment = await this._academicRepository.createEnrollment(input.studentId, input.courseId, input.reason);

    await this._academicRepository.updateCourseEnrollment(input.courseId, AcademicConstants.Enrollment.INCREMENT);

    return {
      data: {
        success: true,
        message: AcademicConstants.Messages.ENROLLMENT_SUCCESS,
        enrollmentId: enrollment.id
      },
      success: true
    };
  }
}

export class DropCourseUseCase implements IDropCourseUseCase {
  constructor(private _academicRepository: IAcademicRepository) { }

  async execute(input: DropCourseRequestDTO): Promise<ResponseDTO<DropCourseResponseDTO>> {
    const enrollment = await this._academicRepository.findEnrollment(input.studentId, input.courseId);
    if (!enrollment) {
      throw new NotEnrolledError();
    }

    const success = await this._academicRepository.deleteEnrollment(input.studentId, input.courseId);
    if (!success) {
      throw new EnrollmentFailedError(AcademicConstants.Messages.FAILED_TO_DROP);
    }

    await this._academicRepository.updateCourseEnrollment(input.courseId, AcademicConstants.Enrollment.DECREMENT);

    return {
      data: {
        success: true,
        message: AcademicConstants.Messages.DROP_SUCCESS
      },
      success: true
    };
  }
}

export class RequestTranscriptUseCase implements IRequestTranscriptUseCase {
  constructor(private _academicRepository: IAcademicRepository) { }

  async execute(input: RequestTranscriptRequestDTO): Promise<ResponseDTO<RequestTranscriptResponseDTO>> {
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + AcademicConstants.Transcript.DELIVERY_ESTIMATE_DAYS);

    const request = await this._academicRepository.createTranscriptRequest({
      userId: input.studentId,
      deliveryMethod: input.deliveryMethod,
      requestedAt: new Date(),
      estimatedDelivery: estimatedDeliveryDate,
      address: input.address,
      email: input.email
    });

    return {
      data: {
        success: true,
        message: AcademicConstants.Messages.TRANSCRIPT_SUCCESS,
        requestId: request.id,
        estimatedDelivery: request.estimatedDelivery.toISOString()
      },
      success: true
    };
  }
}
