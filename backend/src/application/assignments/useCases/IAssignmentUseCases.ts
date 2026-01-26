import {
  CreateAssignmentDTO,
  UpdateAssignmentDTO,
  AssignmentResponseDTO,
  SubmissionResponseDTO,
  PaginatedResponseDTO,
  ReviewSubmissionDTO
} from '../dtos/AssignmentDTOs';
import { AnalyticsData } from '../dtos/AnalyticsDTOs';

export interface IGetAssignmentsUseCase {
  execute(params: { subject?: string; status?: string; page?: number; limit?: number; search?: string }): Promise<PaginatedResponseDTO<AssignmentResponseDTO>>;
}

export interface IGetAssignmentByIdUseCase {
  execute(params: { id: string }): Promise<AssignmentResponseDTO>;
}

export interface ICreateAssignmentUseCase {
  execute(params: CreateAssignmentDTO): Promise<AssignmentResponseDTO>;
}

export interface IUpdateAssignmentUseCase {
  execute(params: UpdateAssignmentDTO): Promise<AssignmentResponseDTO>;
}

export interface IDeleteAssignmentUseCase {
  execute(params: { id: string }): Promise<{ message: string }>;
}

export interface IGetSubmissionsUseCase {
  execute(params: { assignmentId: string; page?: number; limit?: number; search?: string; status?: string }): Promise<PaginatedResponseDTO<SubmissionResponseDTO>>;
}

export interface IGetSubmissionByIdUseCase {
  execute(params: { assignmentId: string; submissionId: string }): Promise<SubmissionResponseDTO>;
}

export interface IReviewSubmissionUseCase {
  execute(params: ReviewSubmissionDTO): Promise<SubmissionResponseDTO>;
}

export interface IGetAnalyticsUseCase {
  execute(): Promise<AnalyticsData>;
}

export interface IServeAssignmentFileUseCase {
  execute(params: { assignmentId: string; fileName: string }): Promise<{ pdfData: string; fileName: string; contentType: string }>;
}
