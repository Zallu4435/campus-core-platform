import { Assignment } from "../../../../domain/assignments/entities/Assignment";
import { Submission } from "../../../../domain/assignments/entities/Submission";
import { IAssignmentSource, ISubmissionSource, IAssignmentFileSource } from "../infraTypes";
import { AssignmentStatus, SubmissionStatus } from "../../../../domain/assignments/enums/AssignmentEnums";
import { AssignmentResponseDTO, SubmissionResponseDTO } from "../../../../application/assignments/dtos/AssignmentDTOs";

export class AssignmentMapper {
    static toDomain(doc: IAssignmentSource): Assignment {
        const id = doc._id ? doc._id.toString() : (doc.id ? doc.id.toString() : '');
        return Assignment.create({
            id,
            title: doc.title,
            subject: doc.subject,
            description: doc.description,
            maxMarks: doc.maxMarks,
            dueDate: doc.dueDate instanceof Date ? doc.dueDate : new Date(doc.dueDate),
            files: (doc.files || []).map(f => ({ ...f, _id: f._id ? f._id.toString() : (f.id ? f.id.toString() : '') })),
            status: doc.status as AssignmentStatus,
            createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt || Date.now()),
            updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt || Date.now()),
            totalSubmissions: doc.totalSubmissions || 0,
            averageMarks: doc.averageMarks || 0,
        });
    }

    static toPersistence(entity: Assignment): Partial<IAssignmentSource> {
        return {
            title: entity.title,
            subject: entity.subject,
            description: entity.description,
            maxMarks: entity.maxMarks,
            dueDate: entity.dueDate,
            files: entity.files as unknown as IAssignmentFileSource[],
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

    static submissionToDomain(doc: ISubmissionSource): Submission {
        const id = doc._id ? doc._id.toString() : (doc.id ? doc.id.toString() : '');
        return Submission.create({
            id,
            assignmentId: doc.assignmentId.toString(),
            studentId: doc.studentId.toString(),
            studentName: doc.studentName,
            submittedDate: doc.submittedDate instanceof Date ? doc.submittedDate : new Date(doc.submittedDate),
            status: doc.status as SubmissionStatus,
            isLate: doc.isLate,
            files: (doc.files || []).map(f => ({ ...f, _id: f._id ? f._id.toString() : (f.id ? f.id.toString() : '') })),
            marks: doc.marks,
            feedback: doc.feedback,
            reviewedAt: doc.reviewedAt ? (doc.reviewedAt instanceof Date ? doc.reviewedAt : new Date(doc.reviewedAt)) : undefined,
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
