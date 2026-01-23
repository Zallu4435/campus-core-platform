import { AssignmentResponseDTO, SubmissionResponseDTO, FileDTO } from './AssignmentDTOs';
import { SubmissionStatus } from '../../../domain/assignments/enums/AssignmentEnums';

export interface UserAssignmentResponseDTO extends AssignmentResponseDTO {
    submission: SubmissionResponseDTO | null;
}

export interface SubmitAssignmentDTO {
    assignmentId: string;
    studentId: string;
    files: FileDTO[];
}

export interface UserAssignmentStatusDTO {
    status: SubmissionStatus;
    submittedAt?: Date;
    score?: number;
}

export interface UserAssignmentFeedbackDTO {
    feedback: string;
    score: number;
    reviewedAt: Date;
}
