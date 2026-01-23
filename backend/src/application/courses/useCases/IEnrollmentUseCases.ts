import {
  GetEnrollmentsRequestDTO,
  ApproveEnrollmentRequestDTO,
  RejectEnrollmentRequestDTO,
  GetCourseRequestDetailsRequestDTO,
  GetEnrollmentsResponseDTO,
  GetCourseRequestDetailsResponseDTO,
} from "../dtos/EnrollmentRequestDTOs";

export interface IGetEnrollmentsUseCase {
  execute(params: GetEnrollmentsRequestDTO): Promise<{ success: boolean; data: GetEnrollmentsResponseDTO }>;
}

export interface IApproveEnrollmentUseCase {
  execute(params: ApproveEnrollmentRequestDTO): Promise<{ success: boolean; data: void }>;
}

export interface IRejectEnrollmentUseCase {
  execute(params: RejectEnrollmentRequestDTO): Promise<{ success: boolean; data: void }>;
}

export interface IGetCourseRequestDetailsUseCase {
  execute(params: GetCourseRequestDetailsRequestDTO): Promise<{ success: boolean; data: GetCourseRequestDetailsResponseDTO | null }>;
}
