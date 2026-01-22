import { Document } from 'mongoose';
import { Faculty } from '../../../../domain/auth/entities/Auth';
import { FacultyDTO } from '../../../../application/auth/dtos/UserDTO';

/**
 * FacultyMapper - Data Mapper Pattern
 * Maps between domain entities and persistence layer (Mongoose documents)
 * Prevents infrastructure concerns from leaking into the application layer
 */
export class FacultyMapper {
    /**
     * Map Mongoose document to Domain entity
     * @param mongooseDoc - The Mongoose document
     * @returns Domain Faculty entity
     */
    static toDomain(mongooseDoc: Document | any): Faculty {
        if (!mongooseDoc) {
            throw new Error('Cannot map null document to domain entity');
        }

        return Faculty.create({
            id: mongooseDoc._id?.toString(),
            fullName: mongooseDoc.fullName,
            email: mongooseDoc.email,
            phone: mongooseDoc.phone,
            department: mongooseDoc.department,
            qualification: mongooseDoc.qualification,
            experience: mongooseDoc.experience,
            aboutMe: mongooseDoc.aboutMe,
            cvUrl: mongooseDoc.cvUrl,
            certificatesUrl: mongooseDoc.certificatesUrl
        });
    }

    /**
     * Map Domain entity to Mongoose persistence object
     * @param domainEntity - The domain Faculty entity
     * @returns Plain object for Mongoose persistence
     */
    static toPersistence(domainEntity: Faculty): Record<string, any> {
        return {
            fullName: domainEntity.fullName,
            email: domainEntity.email,
            phone: domainEntity.phone,
            department: domainEntity.department,
            qualification: domainEntity.qualification,
            experience: domainEntity.experience,
            aboutMe: domainEntity.aboutMe,
            cvUrl: domainEntity.cvUrl,
            certificatesUrl: domainEntity.certificatesUrl
        };
    }

    /**
     * Map Mongoose document to DTO (for API responses)
     * @param mongooseDoc - The Mongoose document
     * @returns DTO object
     */
    static toDTO(mongooseDoc: Document | any): FacultyDTO {
        if (!mongooseDoc) {
            throw new Error('Cannot map null document to DTO');
        }

        return {
            id: mongooseDoc._id?.toString() || '',
            fullName: mongooseDoc.fullName,
            email: mongooseDoc.email,
            phone: mongooseDoc.phone,
            department: mongooseDoc.department,
            qualification: mongooseDoc.qualification,
            experience: mongooseDoc.experience,
            aboutMe: mongooseDoc.aboutMe,
            cvUrl: mongooseDoc.cvUrl || undefined,
            certificatesUrl: mongooseDoc.certificatesUrl || undefined
        };
    }

    /**
     * Map array of Mongoose documents to DTOs
     * @param mongooseDocs - Array of Mongoose documents
     * @returns Array of DTO objects
     */
    static toDTOList(mongooseDocs: Array<Document | any>): FacultyDTO[] {
        return mongooseDocs.map(doc => this.toDTO(doc));
    }

    /**
     * Map Mongoose document to minimal faculty info
     * @param mongooseDoc - The Mongoose document
     * @returns Minimal faculty info
     */
    static toMinimalDTO(mongooseDoc: Document | any): {
        id: string;
        fullName: string;
        email: string;
        phone: string;
        department: string;
    } {
        if (!mongooseDoc) {
            throw new Error('Cannot map null document to minimal DTO');
        }

        return {
            id: mongooseDoc._id?.toString() || '',
            fullName: mongooseDoc.fullName,
            email: mongooseDoc.email,
            phone: mongooseDoc.phone,
            department: mongooseDoc.department
        };
    }
}
