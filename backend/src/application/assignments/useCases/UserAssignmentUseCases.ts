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
import { IStorageService } from '../../../application/shared/services/IStorageService';
import Logger from '../../../shared/utils/logger';

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

    const mappedAssignments = assignments.map(({ assignment, submission }) => {
      const assignmentDTO = AssignmentMapper.toDTO(assignment);
      const submissionDTO = submission ? AssignmentMapper.submissionToDTO(submission) : null;
      return { ...assignmentDTO, submission: submissionDTO };
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
  constructor(
    private userAssignmentRepository: IUserAssignmentRepository,
    private storageService: IStorageService
  ) { }

  async execute(params: SubmitAssignmentDTO): Promise<UserAssignmentResponseDTO> {

    // Check for existing submission to clean up files later if needed
    // Assuming `getAssignmentById` returns submission info for the student
    const { submission: existingSubmission } = await this.userAssignmentRepository.getAssignmentById(params.assignmentId, params.studentId);

    // NOTE: This repository method seems to UPSERT/REPLACE the submission.
    // If we are overwriting, we should delete the old files. 
    // If the logic was APPEND, we would treat this differently. Assuming REPLACE based on 'findOneAndUpdate' with upsert.

    try {
      const submission = await this.userAssignmentRepository.submitAssignment(
        params.assignmentId,
        params.files,
        params.studentId
      );

      const { assignment } = await this.userAssignmentRepository.getAssignmentById(params.assignmentId, params.studentId);

      if (!assignment) {
        throw new AssignmentNotFoundError(params.assignmentId);
      }

      // Success: If there was a previous submission with files, delete them as they are now replaced
      if (existingSubmission && existingSubmission.files && existingSubmission.files.length > 0) {
        // Only perform cleanup if the new submission ID matches existing (it should for upsert)
        // or if we know we replaced the data.
        Logger.info('🗑️ Deleting old student submission files after re-submission...');
        for (const file of existingSubmission.files) {
          await this.storageService.deleteFile(file.fileUrl);
        }
      }

      const assignmentDTO = AssignmentMapper.toDTO(assignment);
      const submissionDTO = AssignmentMapper.submissionToDTO(submission);

      return {
        ...assignmentDTO,
        submission: submissionDTO
      };
    } catch (error) {
      // Failure: Delete newly uploaded files
      if (params.files && params.files.length > 0) {
        Logger.warn('⚠️ DB Submission failed. Deleting uploaded student files...');
        for (const file of params.files) {
          await this.storageService.deleteFile(file.path);
        }
      }
      throw error;
    }
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