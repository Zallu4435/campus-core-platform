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
  CourseSummaryDTO,
} from "../dtos/CourseResponseDTOs";

export interface IGetCoursesUseCase {
  execute(params: GetCoursesRequestDTO): Promise<GetCoursesResponseDTO>;
}

export interface IGetCourseByIdUseCase {
  execute(params: GetCourseByIdRequestDTO): Promise<GetCourseByIdResponseDTO>;
}

export interface ICreateCourseUseCase {
  execute(params: CreateCourseRequestDTO): Promise<CreateCourseResponseDTO>;
}

export interface IUpdateCourseUseCase {
  execute(params: UpdateCourseRequestDTO): Promise<UpdateCourseResponseDTO>;
}

export interface IDeleteCourseUseCase {
  execute(params: DeleteCourseRequestDTO): Promise<void>;
}
