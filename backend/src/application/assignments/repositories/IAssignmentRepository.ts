import { Assignment } from "../../../domain/assignments/entities/Assignment";
import { Submission } from "../../../domain/assignments/entities/Submission";
import { AnalyticsData } from "../dtos/AnalyticsDTOs";

export interface IAssignmentRepository {
  getAssignments(subject?: string, status?: string, page?: number, limit?: number, search?: string): Promise<{ assignments: Assignment[]; total: number; page: number; limit: number }>;
  getAssignmentById(id: string): Promise<Assignment | null>;
  createAssignment(assignment: Assignment): Promise<Assignment>;
  updateAssignment(id: string, assignment: Partial<Assignment>): Promise<Assignment | null>;
  deleteAssignment(id: string): Promise<boolean>;
  getSubmissions(assignmentId: string, page: number, limit: number, search?: string, status?: string): Promise<{ submissions: Submission[]; total: number; page: number; limit: number }>;
  getSubmissionById(assignmentId: string, submissionId: string): Promise<Submission | null>;
  reviewSubmission(assignmentId: string, submissionId: string, marks: number, feedback: string, status: string, isLate: boolean): Promise<Submission | null>;
  getSubmissionsStats(assignmentIds: string[]): Promise<Array<{
    _id: string;
    totalSubmissions: number;
    totalMarks: number;
    gradedSubmissions: number;
  }>>;
  getAnalytics(): Promise<AnalyticsData>;
} 