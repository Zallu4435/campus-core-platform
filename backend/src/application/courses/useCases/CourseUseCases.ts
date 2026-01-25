import {
  GetCoursesRequestDTO,
  GetCourseByIdRequestDTO,
  CreateCourseRequestDTO,
  UpdateCourseRequestDTO,
  DeleteCourseRequestDTO,
} from "../dtos/CourseRequestDTOs";
import {
  GetCoursesResponseDTO,
  GetCourseByIdResponseDTO,
  CreateCourseResponseDTO,
  UpdateCourseResponseDTO,
} from "../dtos/CourseResponseDTOs";
import { ICoursesRepository } from "../repositories/ICoursesRepository";
import { CourseNotFoundError, InvalidCourseIdError } from "../../../domain/courses/errors/CourseErrors";
import { CourseMapper } from "../../../infrastructure/repositories/courses/mappers/CourseMapper";
import {
  IGetCoursesUseCase,
  IGetCourseByIdUseCase,
  ICreateCourseUseCase,
  IUpdateCourseUseCase,
  IDeleteCourseUseCase
} from "./ICourseUseCases";


export class GetCoursesUseCase implements IGetCoursesUseCase {
  constructor(private readonly _courseRepository: ICoursesRepository) { }

  async execute(params: GetCoursesRequestDTO): Promise<GetCoursesResponseDTO> {
    const result = await this._courseRepository.getCourses(params);
    return {
      data: result.courses, // Already mapped to CourseSummaryDTO by repository
      totalItems: result.totalItems,
      totalPages: Math.ceil(result.totalItems / result.limit),
      currentPage: result.page,
    };
  }
}

export class GetCourseByIdUseCase implements IGetCourseByIdUseCase {
  constructor(private readonly _courseRepository: ICoursesRepository) { }

  async execute(params: GetCourseByIdRequestDTO): Promise<GetCourseByIdResponseDTO> {
    if (!params.id) {
      throw new InvalidCourseIdError();
    }
    const course = await this._courseRepository.getCourseById(params.id);
    if (!course) {
      throw new CourseNotFoundError(params.id);
    }
    return {
      course: CourseMapper.entityToDTO(course)
    };
  }
}

export class CreateCourseUseCase implements ICreateCourseUseCase {
  constructor(private readonly _courseRepository: ICoursesRepository) { }

  async execute(params: CreateCourseRequestDTO): Promise<CreateCourseResponseDTO> {
    const newCourse = await this._courseRepository.createCourse(params);
    return {
      course: CourseMapper.entityToDTO(newCourse)
    };
  }
}

export class UpdateCourseUseCase implements IUpdateCourseUseCase {
  constructor(private readonly _courseRepository: ICoursesRepository) { }

  async execute(params: UpdateCourseRequestDTO): Promise<UpdateCourseResponseDTO> {
    if (!params.id) {
      throw new InvalidCourseIdError();
    }
    const updatedCourse = await this._courseRepository.updateCourse(params);
    if (!updatedCourse) {
      throw new CourseNotFoundError(params.id);
    }
    return {
      course: CourseMapper.entityToDTO(updatedCourse)
    };
  }
}

export class DeleteCourseUseCase implements IDeleteCourseUseCase {
  constructor(private readonly _courseRepository: ICoursesRepository) { }

  async execute(params: DeleteCourseRequestDTO): Promise<void> {
    if (!params.id) {
      throw new InvalidCourseIdError();
    }
    await this._courseRepository.deleteCourse(params);
  }
}