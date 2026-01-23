import { Assignment } from "../../../../domain/assignments/entities/Assignment";
import { Submission } from "../../../../domain/assignments/entities/Submission";
import { IAssignmentDocument } from "../../../database/mongoose/assignment/AssignmentModel";
import { ISubmissionDocument } from "../../../database/mongoose/assignment/SubmissionModel";
import { AssignmentStatus, SubmissionStatus } from "../../../../domain/assignments/enums/AssignmentEnums";
import { AssignmentResponseDTO, SubmissionResponseDTO } from "../../../../application/assignments/dtos/AssignmentDTOs";

export class AssignmentMapper {
    static toDomain(doc: IAssignmentDocument): Assignment {
        return Assignment.create({
            id: doc._id.toString(),
            title: doc.title,
            subject: doc.subject,
            description: doc.description,
            maxMarks: doc.maxMarks,
            dueDate: doc.dueDate,
            files: doc.files || [],
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            totalSubmissions: doc.totalSubmissions,
            averageMarks: doc.averageMarks,
        });
    }

    static toPersistence(entity: Assignment): Partial<IAssignmentDocument> {
        return {
            title: entity.title,
            subject: entity.subject,
            description: entity.description,
            maxMarks: entity.maxMarks,
            dueDate: entity.dueDate,
            files: entity.files,
            status: entity.status,
            totalSubmissions: entity.totalSubmissions,
            averageMarks: entity.averageMarks,
        };
    }

    static toDTO(entity: Assignment): AssignmentResponseDTO {
        return {
            id: entity.id,
            title: entity.title,
            subject: entity.subject,
            description: entity.description,
            maxMarks: entity.maxMarks,
            dueDate: entity.dueDate,
            files: entity.files,
            status: entity.status,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            totalSubmissions: entity.totalSubmissions,
            averageMarks: entity.averageMarks,
        };
    }

    static submissionToDomain(doc: ISubmissionDocument): Submission {
        return Submission.create({
            id: doc._id.toString(),
            assignmentId: doc.assignmentId.toString(),
            studentId: doc.studentId.toString(),
            studentName: doc.studentName,
            submittedDate: doc.submittedDate,
            status: doc.status as SubmissionStatus,
            isLate: doc.isLate,
            files: doc.files || [],
            marks: doc.marks,
            feedback: doc.feedback,
            reviewedAt: doc.reviewedAt,
        });
    }

    static submissionToDTO(entity: Submission): SubmissionResponseDTO {
        return {
            id: entity.id,
            assignmentId: entity.assignmentId,
            studentId: entity.studentId,
            studentName: entity.studentName,
            submittedDate: entity.submittedDate,
            status: entity.status as SubmissionStatus,
            isLate: entity.isLate,
            files: entity.files,
            marks: entity.marks,
            feedback: entity.feedback,
            reviewedAt: entity.reviewedAt,
        };
    }
}
