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
  ResponseDTO
} from "../dtos/AcademicDTOs";

export interface IGetStudentInfoUseCase {
  execute(input: GetStudentInfoRequestDTO): Promise<ResponseDTO<GetStudentInfoResponseDTO>>;
}

export interface IGetGradeInfoUseCase {
  execute(input: GetGradeInfoRequestDTO): Promise<ResponseDTO<GetGradeInfoResponseDTO>>;
}

export interface IGetCoursesUseCase {
  execute(input: GetCoursesRequestDTO): Promise<ResponseDTO<GetCoursesResponseDTO>>;
}

export interface IGetAcademicHistoryUseCase {
  execute(input: GetAcademicHistoryRequestDTO): Promise<ResponseDTO<GetAcademicHistoryResponseDTO>>;
}

export interface IGetProgramInfoUseCase {
  execute(input: GetProgramInfoRequestDTO): Promise<ResponseDTO<GetProgramInfoResponseDTO>>;
}

export interface IGetProgressInfoUseCase {
  execute(input: GetProgressInfoRequestDTO): Promise<ResponseDTO<GetProgressInfoResponseDTO>>;
}

export interface IGetRequirementsInfoUseCase {
  execute(input: GetRequirementsInfoRequestDTO): Promise<ResponseDTO<GetRequirementsInfoResponseDTO>>;
}

export interface IRegisterCourseUseCase {
  execute(input: RegisterCourseRequestDTO): Promise<ResponseDTO<RegisterCourseResponseDTO>>;
}

export interface IDropCourseUseCase {
  execute(input: DropCourseRequestDTO): Promise<ResponseDTO<DropCourseResponseDTO>>;
}

export interface IRequestTranscriptUseCase {
  execute(input: RequestTranscriptRequestDTO): Promise<ResponseDTO<RequestTranscriptResponseDTO>>;
}
