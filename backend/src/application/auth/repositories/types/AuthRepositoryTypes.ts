import { UserDTO, UserDTOWithPassword, FacultyDTO } from "../../dtos/UserDTO";
import { AuthCollection } from "../../constants/AuthConstants";

/**
 * Shared types for Auth Repository
 * Centralizes return type definitions for better maintainability
 */

/**
 * User collection types
 */
export type UserCollection = AuthCollection;

/**
 * User with collection info (with password)
 */
export interface UserWithCollectionAndPassword {
    user: UserDTOWithPassword;
    collection: UserCollection;
}

/**
 * User with collection info (without password)
 */
export interface UserWithCollection {
    user: UserDTO;
    collection: UserCollection;
}

/**
 * Refresh session data
 */
export interface RefreshSessionData {
    userId: string;
    sessionId: string;
    refreshToken: string;
    userAgent: string;
    ipAddress: string;
    createdAt: Date;
    lastUsedAt: Date;
    expiresAt: Date;
}

/**
 * Registration result
 */
export interface RegisterResult {
    message: string;
    user: UserDTO;
}

/**
 * Faculty registration result
 */
export interface RegisterFacultyResult {
    user: FacultyDTO;
    collection: AuthCollection.FACULTY;
}
