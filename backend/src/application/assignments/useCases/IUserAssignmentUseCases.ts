import {
  UserAssignmentResponseDTO,
  SubmitAssignmentDTO,
  UserAssignmentStatusDTO,
  UserAssignmentFeedbackDTO
} from '../dtos/UserAssignmentDTOs';
import { PaginatedResponseDTO } from '../dtos/AssignmentDTOs';

export interface IGetUserAssignmentsUseCase {
  execute(params: { studentId: string; subject?: string; status?: string; page?: number; limit?: number; search?: string; sortBy?: string }): Promise<PaginatedResponseDTO<UserAssignmentResponseDTO>>;
}

export interface IGetUserAssignmentByIdUseCase {
  execute(params: { id: string; studentId: string }): Promise<UserAssignmentResponseDTO>;
}

export interface ISubmitUserAssignmentUseCase {
  execute(params: SubmitAssignmentDTO): Promise<UserAssignmentResponseDTO>;
}

export interface IGetUserAssignmentStatusUseCase {
  execute(params: { assignmentId: string; studentId: string }): Promise<UserAssignmentStatusDTO>;
}

export interface IGetUserAssignmentFeedbackUseCase {
  execute(params: { assignmentId: string; studentId: string }): Promise<UserAssignmentFeedbackDTO>;
}
