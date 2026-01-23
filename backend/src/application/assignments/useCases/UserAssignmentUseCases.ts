import { IUserAssignmentRepository } from '../../../application/assignments/repositories/IUserAssignmentRepository';
import {
  UserAssignmentResponseDTO,
  SubmitAssignmentDTO,
  UserAssignmentStatusDTO,
  UserAssignmentFeedbackDTO
} from '../dtos/UserAssignmentDTOs';
import { PaginatedResponseDTO } from '../dtos/AssignmentDTOs';
import {
  IGetUserAssignmentsUseCase,
  IGetUserAssignmentByIdUseCase,
  ISubmitUserAssignmentUseCase,
  IGetUserAssignmentStatusUseCase,
  IGetUserAssignmentFeedbackUseCase
} from "./IUserAssignmentUseCases";
import { AssignmentMapper } from '../../../infrastructure/repositories/assignments/mappers/AssignmentMapper';
import { SubmissionStatus } from '../../../domain/assignments/enums/AssignmentEnums';
import {
  AssignmentNotFoundError,
  SubmissionNotFoundError
} from '../../../domain/assignments/errors/AssignmentErrors';

export class GetUserAssignmentsUseCase implements IGetUserAssignmentsUseCase {
  constructor(private userAssignmentRepository: IUserAssignmentRepository) { }

  async execute(params: { studentId: string; subject?: string; status?: string; page?: number; limit?: number; search?: string; sortBy?: string }): Promise<PaginatedResponseDTO<UserAssignmentResponseDTO>> {
    const { assignments, total, page, limit } = await this.userAssignmentRepository.getAssignments(
      params.subject,
      params.status,
      params.page,
      params.limit,
      params.search,
      params.studentId,
      params.sortBy
    );

    const mappedAssignments = assignments.map(assignment => {
      const dto = AssignmentMapper.toDTO(assignment);
      return { ...dto, submission: null };
    });

    return {
      data: mappedAssignments as UserAssignmentResponseDTO[],
      total,
      page,
      limit
    };
  }
}

export class GetUserAssignmentByIdUseCase implements IGetUserAssignmentByIdUseCase {
  constructor(private userAssignmentRepository: IUserAssignmentRepository) { }

  async execute(params: { id: string; studentId: string }): Promise<UserAssignmentResponseDTO> {
    const { assignment, submission } = await this.userAssignmentRepository.getAssignmentById(params.id, params.studentId);
    if (!assignment) {
      throw new AssignmentNotFoundError(params.id);
    }

    const assignmentDTO = AssignmentMapper.toDTO(assignment);
    const submissionDTO = submission ? AssignmentMapper.submissionToDTO(submission) : null;

    return {
      ...assignmentDTO,
      submission: submissionDTO
    };
  }
}

export class SubmitUserAssignmentUseCase implements ISubmitUserAssignmentUseCase {
  constructor(private userAssignmentRepository: IUserAssignmentRepository) { }

  async execute(params: SubmitAssignmentDTO): Promise<UserAssignmentResponseDTO> {
    const submission = await this.userAssignmentRepository.submitAssignment(
      params.assignmentId,
      params.files,
      params.studentId
    );

    const { assignment } = await this.userAssignmentRepository.getAssignmentById(params.assignmentId, params.studentId);

    if (!assignment) {
      throw new AssignmentNotFoundError(params.assignmentId);
    }

    const assignmentDTO = AssignmentMapper.toDTO(assignment);
    const submissionDTO = AssignmentMapper.submissionToDTO(submission);

    return {
      ...assignmentDTO,
      submission: submissionDTO
    };
  }
}

export class GetUserAssignmentStatusUseCase implements IGetUserAssignmentStatusUseCase {
  constructor(private userAssignmentRepository: IUserAssignmentRepository) { }

  async execute(params: { assignmentId: string; studentId: string }): Promise<UserAssignmentStatusDTO> {
    const submission = await this.userAssignmentRepository.getAssignmentStatus(params.assignmentId, params.studentId);
    if (!submission) {
      return { status: SubmissionStatus.Pending };
    }
    return {
      status: submission.status,
      submittedAt: submission.submittedDate,
      score: submission.marks
    };
  }
}

export class GetUserAssignmentFeedbackUseCase implements IGetUserAssignmentFeedbackUseCase {
  constructor(private userAssignmentRepository: IUserAssignmentRepository) { }

  async execute(params: { assignmentId: string; studentId: string }): Promise<UserAssignmentFeedbackDTO> {
    const submission = await this.userAssignmentRepository.getAssignmentFeedback(params.assignmentId, params.studentId);
    if (!submission) {
      throw new SubmissionNotFoundError(params.assignmentId); // Or a specific FeedbackNotFoundError if we had one
    }
    return {
      feedback: submission.feedback || '',
      score: submission.marks || 0,
      reviewedAt: submission.reviewedAt || new Date()
    };
  }
}