import { Document } from 'mongoose';
import { User } from '../../../../domain/auth/entities/Auth';
import { UserDTO, UserDTOWithPassword } from '../../../../application/auth/dtos/UserDTO';

/**
 * UserMapper - Data Mapper Pattern
 * Maps between domain entities and persistence layer (Mongoose documents)
 * Prevents infrastructure concerns from leaking into the application layer
 */
export class UserMapper {
    /**
     * Map Mongoose document to Domain entity
     * @param mongooseDoc - The Mongoose document
     * @returns Domain User entity
     */
    static toDomain(mongooseDoc: Document | any): User {
        if (!mongooseDoc) {
            throw new Error('Cannot map null document to domain entity');
        }

        return User.create({
            id: mongooseDoc._id?.toString(),
            firstName: mongooseDoc.firstName,
            lastName: mongooseDoc.lastName,
            email: mongooseDoc.email,
            password: mongooseDoc.password,
            profilePicture: mongooseDoc.profilePicture,
            blocked: mongooseDoc.blocked,
            pending: mongooseDoc.pending
        });
    }

    /**
     * Map Domain entity to Mongoose persistence object
     * @param domainEntity - The domain User entity
     * @returns Plain object for Mongoose persistence
     */
    static toPersistence(domainEntity: User): Record<string, any> {
        return {
            firstName: domainEntity.firstName,
            lastName: domainEntity.lastName,
            email: domainEntity.email,
            password: domainEntity.password,
            profilePicture: domainEntity.profilePicture,
            blocked: domainEntity.blocked,
            pending: domainEntity.pending
        };
    }

    /**
     * Map Mongoose document to DTO (for API responses)
     * This is what gets sent to the client
     * @param mongooseDoc - The Mongoose document
     * @returns DTO object
     */
    static toDTO(mongooseDoc: Document | any): UserDTO {
        if (!mongooseDoc) {
            throw new Error('Cannot map null document to DTO');
        }

        return {
            id: mongooseDoc._id?.toString() || '',
            firstName: mongooseDoc.firstName,
            lastName: mongooseDoc.lastName,
            email: mongooseDoc.email,
            profilePicture: mongooseDoc.profilePicture || undefined,
            blocked: mongooseDoc.blocked,
            pending: mongooseDoc.pending
        };
    }

    /**
     * Map Mongoose document to DTO with password (for internal use only)
     * WARNING: Never send this to the client!
     * @param mongooseDoc - The Mongoose document
     * @returns DTO object with password
     */
    static toDTOWithPassword(mongooseDoc: Document | any): UserDTOWithPassword {
        if (!mongooseDoc) {
            throw new Error('Cannot map null document to DTO');
        }

        return {
            id: mongooseDoc._id?.toString() || '',
            firstName: mongooseDoc.firstName,
            lastName: mongooseDoc.lastName,
            email: mongooseDoc.email,
            profilePicture: mongooseDoc.profilePicture || '',
            password: mongooseDoc.password,
            blocked: mongooseDoc.blocked,
            pending: mongooseDoc.pending
        };
    }

    /**
     * Map array of Mongoose documents to DTOs
     * @param mongooseDocs - Array of Mongoose documents
     * @returns Array of DTO objects
     */
    static toDTOList(mongooseDocs: Array<Document | any>): UserDTO[] {
        return mongooseDocs.map(doc => this.toDTO(doc));
    }

    /**
     * Map Mongoose document to minimal user info (for tokens, etc.)
     * @param mongooseDoc - The Mongoose document
     * @returns Minimal user info
     */
    static toMinimalDTO(mongooseDoc: Document | any): { id: string; email: string } {
        if (!mongooseDoc) {
            throw new Error('Cannot map null document to minimal DTO');
        }

        return {
            id: mongooseDoc._id?.toString() || '',
            email: mongooseDoc.email
        };
    }
}
