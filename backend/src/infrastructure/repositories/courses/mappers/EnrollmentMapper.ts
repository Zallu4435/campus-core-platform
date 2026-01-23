import { Enrollment } from '../../../../domain/courses/entities/CourseEnrollment';
import { IEnrollmentDocument, PopulatedEnrollmentDocument } from '../infraTypes';

import { EnrollmentDetailsDTO } from '../../../../application/courses/dtos/EnrollmentRequestDTOs';

/**
 * EnrollmentMapper
 * Maps between domain entities, Mongoose documents, and DTOs for enrollments
 */

/**
 * EnrollmentMapper - Data Mapper Pattern
 * Maps between domain entities, persistence layer (Mongoose documents), and DTOs
 * Handles populated enrollment documents with student and course information
 */
export class EnrollmentMapper {
    /**
     * Map Mongoose document to Domain entity
     * @param mongooseDoc - The Mongoose document
     * @returns Domain Enrollment entity
     */
    static toDomain(mongooseDoc: IEnrollmentDocument): Enrollment {
        if (!mongooseDoc) {
            throw new Error('Cannot map null document to domain entity');
        }

        return new Enrollment({
            id: mongooseDoc._id?.toString(),
            studentId: typeof mongooseDoc.studentId === 'string'
                ? mongooseDoc.studentId
                : mongooseDoc.studentId._id.toString(),
            courseId: typeof mongooseDoc.courseId === 'string'
                ? mongooseDoc.courseId
                : mongooseDoc.courseId._id.toString(),
            status: mongooseDoc.status as any,
            requestedAt: mongooseDoc.requestedAt,
            reason: mongooseDoc.reason,
        });
    }

    /**
     * Map Domain entity to Mongoose persistence object
     * @param domainEntity - The domain Enrollment entity
     * @returns Plain object for Mongoose persistence
     */
    static toPersistence(domainEntity: Enrollment): Record<string, any> {
        return {
            studentId: domainEntity.studentId,
            courseId: domainEntity.courseId,
            status: domainEntity.status,
            requestedAt: domainEntity.requestedAt,
            reason: domainEntity.reason,
        };
    }

    /**
     * Map populated Mongoose document to DTO (for API responses)
     * This handles documents with populated student and course references
     * @param mongooseDoc - The populated Mongoose document
     * @returns EnrollmentDetailsDTO object
     */
    static toDTO(mongooseDoc: PopulatedEnrollmentDocument): EnrollmentDetailsDTO {
        if (!mongooseDoc) {
            throw new Error('Cannot map null document to DTO');
        }

        // Handle populated studentId
        const studentId = typeof mongooseDoc.studentId === 'string'
            ? mongooseDoc.studentId
            : mongooseDoc.studentId?._id?.toString() || '';
        const studentEmail = typeof mongooseDoc.studentId === 'string'
            ? ''
            : mongooseDoc.studentId?.email || '';
        const studentFirstName = typeof mongooseDoc.studentId === 'string'
            ? ''
            : (mongooseDoc.studentId as any)?.firstName || '';
        const studentLastName = typeof mongooseDoc.studentId === 'string'
            ? ''
            : (mongooseDoc.studentId as any)?.lastName || '';

        // Handle populated courseId
        const courseId = typeof mongooseDoc.courseId === 'string'
            ? mongooseDoc.courseId
            : mongooseDoc.courseId?._id?.toString() || '';
        const courseTitle = typeof mongooseDoc.courseId === 'string'
            ? ''
            : mongooseDoc.courseId?.title || '';
        const courseSpecialization = typeof mongooseDoc.courseId === 'string'
            ? undefined
            : mongooseDoc.courseId?.specialization;
        const courseTerm = typeof mongooseDoc.courseId === 'string'
            ? undefined
            : (mongooseDoc.courseId as any)?.term;
        const courseFaculty = typeof mongooseDoc.courseId === 'string'
            ? undefined
            : (mongooseDoc.courseId as any)?.faculty;
        const courseCredits = typeof mongooseDoc.courseId === 'string'
            ? undefined
            : (mongooseDoc.courseId as any)?.credits;

        return {
            id: mongooseDoc._id?.toString() || '',
            studentId,
            studentEmail,
            studentFirstName,
            studentLastName,
            courseId,
            courseTitle,
            courseSpecialization,
            courseTerm,
            courseFaculty,
            courseCredits,
            status: mongooseDoc.status,
            requestedAt: mongooseDoc.requestedAt,
            reason: mongooseDoc.reason,
            createdAt: mongooseDoc.createdAt,
            updatedAt: mongooseDoc.updatedAt,
        };
    }

    /**
     * Map array of populated Mongoose documents to DTOs
     * @param mongooseDocs - Array of populated Mongoose documents
     * @returns Array of EnrollmentDetailsDTO objects
     */
    static toDTOList(mongooseDocs: PopulatedEnrollmentDocument[]): EnrollmentDetailsDTO[] {
        return mongooseDocs.map(doc => this.toDTO(doc));
    }
}
