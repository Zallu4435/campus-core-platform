import { Assignment } from '../../../domain/assignments/entities/Assignment';
import { Submission } from '../../../domain/assignments/entities/Submission';
import { FileDTO } from '../dtos/AssignmentDTOs';

export interface IUserAssignmentRepository {
  getAssignments(subject?: string, status?: string, page?: number, limit?: number, search?: string, studentId?: string, sortBy?: string): Promise<{ assignments: { assignment: Assignment; submission: Submission | null }[]; page: number; limit: number; total: number }>;
  getAssignmentById(id: string, studentId: string): Promise<{ assignment: Assignment | null; submission: Submission | null }>;
  submitAssignment(assignmentId: string, files: FileDTO[], studentId: string): Promise<Submission>;
  getAssignmentStatus(assignmentId: string, studentId: string): Promise<Submission | null>;
  getAssignmentFeedback(assignmentId: string, studentId: string): Promise<Submission | null>;
}
