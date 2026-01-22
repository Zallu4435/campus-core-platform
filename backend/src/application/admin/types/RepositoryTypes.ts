// RepositoryTypes.ts
/**
 * Type definitions for repository operations
 * These types provide type safety for database queries
 */

import { AdminAdmissionStatus } from "../../../domain/admin/entities/AdminAdmissionTypes";

/**
 * Filter type for admission queries
 * Supports MongoDB-style query operators
 */
export interface AdmissionFilter {
    status?: AdminAdmissionStatus | { $in: AdminAdmissionStatus[] };
    choiceOfStudy?: {
        $elemMatch: {
            programme: { $regex: string; $options: string };
        };
    };
    createdAt?: {
        $gte?: Date;
        $lte?: Date;
    };
    $or?: Array<{
        "personal.fullName"?: { $regex: string; $options: string };
        "personal.emailAddress"?: { $regex: string; $options: string };
    }>;
    _id?: string;
    "documents.documents"?: {
        $elemMatch: { id: string };
    };
    [key: string]: unknown;
}

/**
 * Projection type for selecting specific fields
 * MongoDB-style field selection (1 = include, 0 = exclude)
 */
export interface AdmissionProjection {
    _id?: 1 | 0;
    "personal.fullName"?: 1 | 0;
    "personal.emailAddress"?: 1 | 0;
    createdAt?: 1 | 0;
    status?: 1 | 0;
    choiceOfStudy?: 1 | 0;
    [key: string]: 1 | 0 | undefined;
}

/**
 * Raw data from database (before mapping to domain)
 */
export interface AdmissionRawData {
    _id?: unknown;
    id?: string;
    registerId?: unknown;
    applicationId?: string;
    personal?: {
        fullName?: string;
        emailAddress?: string;
        phoneNumber?: string;
        dateOfBirth?: Date | string;
        gender?: string;
        nationality?: string;
    };
    choiceOfStudy?: Array<{
        programme?: string;
        degree?: string;
        catalogYear?: string;
    }>;
    education?: Record<string, unknown>;
    achievements?: Record<string, unknown>;
    otherInformation?: Record<string, unknown>;
    documents?: {
        documents?: Array<{
            id: string;
            fileName: string;
            fileType?: string;
            url?: string;
            cloudinaryUrl?: string;
            path?: string;
            uploadedAt?: Date;
        }>;
    };
    declaration?: Record<string, unknown>;
    paymentId?: string;
    status?: string;
    confirmationToken?: string;
    tokenExpiry?: Date;
    rejectedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Persistence data structure (for database operations)
 */
export interface AdmissionPersistenceData {
    _id?: string;
    status?: string;
    rejectedBy?: string;
    confirmationToken?: string | undefined;
    tokenExpiry?: Date | undefined;
    personal?: {
        fullName: string;
        emailAddress: string;
        phoneNumber?: string;
        dateOfBirth?: Date | string;
        gender?: string;
        nationality?: string;
    };
    [key: string]: unknown;
}

/**
 * Configuration type for use cases
 */
export interface AppConfig {
    frontendUrl: string;
    [key: string]: unknown;
}
