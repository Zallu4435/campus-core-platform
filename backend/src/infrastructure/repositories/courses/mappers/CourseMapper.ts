import { Course } from '../../../../domain/courses/entities/Course';
import { ICourseDocument } from '../infraTypes';
import { CourseSummaryDTO, CourseDetailsDTO } from '../../../../application/courses/dtos/CourseResponseDTOs';

/**
 * CourseMapper - Data Mapper Pattern
 * Maps between domain entities, persistence layer (Mongoose documents), and DTOs
 * Prevents infrastructure concerns from leaking into the application layer
 */
export class CourseMapper {
    /**
     * Map Mongoose document to Domain entity
     * @param mongooseDoc - The Mongoose document
     * @returns Domain Course entity
     */
    static toDomain(mongooseDoc: ICourseDocument): Course {
        if (!mongooseDoc) {
            throw new Error('Cannot map null document to domain entity');
        }

        return new Course({
            id: mongooseDoc._id?.toString(),
            title: mongooseDoc.title,
            specialization: mongooseDoc.specialization,
            faculty: mongooseDoc.faculty,
            credits: mongooseDoc.credits,
            schedule: mongooseDoc.schedule,
            maxEnrollment: mongooseDoc.maxEnrollment,
            currentEnrollment: mongooseDoc.currentEnrollment || 0,
            description: mongooseDoc.description,
            term: mongooseDoc.term,
            prerequisites: mongooseDoc.prerequisites,
        });
    }

    /**
     * Map Domain entity to Mongoose persistence object
     * @param domainEntity - The domain Course entity
     * @returns Plain object for Mongoose persistence
     */
    static toPersistence(domainEntity: Course): Record<string, any> {
        return {
            title: domainEntity.title,
            specialization: domainEntity.specialization,
            faculty: domainEntity.faculty,
            credits: domainEntity.credits,
            schedule: domainEntity.schedule,
            maxEnrollment: domainEntity.maxEnrollment,
            currentEnrollment: domainEntity.currentEnrollment,
            description: domainEntity.description,
            term: domainEntity.term,
            prerequisites: domainEntity.prerequisites,
        };
    }

    /**
     * Map Mongoose document to full Course DTO (for API responses)
     * This is what gets sent to the client for detailed course views
     * @param mongooseDoc - The Mongoose document
     * @returns CourseDetailsDTO object
     */
    static toDTO(mongooseDoc: ICourseDocument): CourseDetailsDTO {
        if (!mongooseDoc) {
            throw new Error('Cannot map null document to DTO');
        }

        return {
            id: mongooseDoc._id?.toString() || '',
            title: mongooseDoc.title,
            specialization: mongooseDoc.specialization,
            faculty: mongooseDoc.faculty,
            credits: mongooseDoc.credits,
            schedule: mongooseDoc.schedule,
            maxEnrollment: mongooseDoc.maxEnrollment,
            currentEnrollment: mongooseDoc.currentEnrollment || 0,
            description: mongooseDoc.description,
            term: mongooseDoc.term,
            prerequisites: mongooseDoc.prerequisites,
        };
    }

    /**
     * Map Mongoose document to summary Course DTO (for list views)
     * This is a lightweight version for course listings
     * @param mongooseDoc - The Mongoose document
     * @returns CourseSummaryDTO object
     */
    static toSummaryDTO(mongooseDoc: ICourseDocument): CourseSummaryDTO {
        if (!mongooseDoc) {
            throw new Error('Cannot map null document to summary DTO');
        }

        return {
            id: mongooseDoc._id?.toString() || '',
            title: mongooseDoc.title,
            specialization: mongooseDoc.specialization,
            faculty: mongooseDoc.faculty,
            term: mongooseDoc.term || '',
            credits: mongooseDoc.credits,
            currentEnrollment: mongooseDoc.currentEnrollment || 0,
            maxEnrollment: mongooseDoc.maxEnrollment || 0,
        };
    }

    /**
     * Map array of Mongoose documents to full DTOs
     * @param mongooseDocs - Array of Mongoose documents
     * @returns Array of CourseDetailsDTO objects
     */
    static toDTOList(mongooseDocs: ICourseDocument[]): CourseDetailsDTO[] {
        return mongooseDocs.map(doc => this.toDTO(doc));
    }

    /**
     * Map array of Mongoose documents to summary DTOs
     * @param mongooseDocs - Array of Mongoose documents
     * @returns Array of CourseSummaryDTO objects
     */
    static toSummaryDTOList(mongooseDocs: ICourseDocument[]): CourseSummaryDTO[] {
        return mongooseDocs.map(doc => this.toSummaryDTO(doc));
    }

    /**
     * Map Domain Entity to DTO
     * Used when the application layer works with Entities but needs to return DTOs
     */
    static entityToDTO(course: Course): CourseDetailsDTO {
        return {
            id: course.id || '',
            title: course.title,
            specialization: course.specialization,
            faculty: course.faculty,
            credits: course.credits,
            schedule: course.schedule,
            maxEnrollment: course.maxEnrollment,
            currentEnrollment: course.currentEnrollment || 0,
            description: course.description,
            term: course.term,
            prerequisites: course.prerequisites,
        };
    }

    static entityToSummaryDTO(course: Course): CourseSummaryDTO {
        return {
            id: course.id || '',
            title: course.title,
            specialization: course.specialization,
            faculty: course.faculty,
            term: course.term || '',
            credits: course.credits,
            currentEnrollment: course.currentEnrollment || 0,
            maxEnrollment: course.maxEnrollment || 0,
        };
    }
}
