// RepositoryTypes.ts
/**
 * Type definitions for Profile repository operations
 * These types provide type safety for database queries
 */

/**
 * Filter type for profile queries
 */
export interface ProfileFilter {
    _id?: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
}

/**
 * Projection type for selecting specific fields
 * MongoDB-style field selection (1 = include, 0 = exclude)
 */
export interface ProfileProjection {
    _id?: 1 | 0;
    firstName?: 1 | 0;
    lastName?: 1 | 0;
    email?: 1 | 0;
    phone?: 1 | 0;
    profilePicture?: 1 | 0;
    passwordChangedAt?: 1 | 0;
    [key: string]: 1 | 0 | undefined;
}

/**
 * Raw data from database (before mapping to domain)
 */
export interface ProfileRawData {
    _id?: unknown;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    profilePicture?: string;
    passwordChangedAt?: Date;
    password?: string;
    updatedAt?: Date;
}
