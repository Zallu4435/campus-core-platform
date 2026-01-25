import { Types } from "mongoose";

export interface IAdmissionSource {
    _id: Types.ObjectId | string;
    registerId?: Types.ObjectId | string;
    applicationId?: string;
    personal?: {
        fullName?: string;
        emailAddress?: string;
        phoneNumber?: string;
        dateOfBirth?: Date | string;
        gender?: string;
        nationality?: string;
        [key: string]: unknown;
    };
    choiceOfStudy?: Array<{
        programme?: string;
        degree?: string;
        catalogYear?: string;
        [key: string]: unknown;
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
            uploadedAt?: Date | string;
            [key: string]: unknown;
        }>;
        [key: string]: unknown;
    };
    declaration?: Record<string, unknown>;
    paymentId?: Types.ObjectId | string;
    status: string;
    rejectedBy?: string;
    confirmationToken?: string;
    tokenExpiry?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    [key: string]: unknown;
}
