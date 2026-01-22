import { AdminAdmission, AdminAdmissionStatus, FullAdmissionDetails } from '../../../domain/admin/entities/AdminAdmissionTypes';

export interface AdmissionResponseDTO {
    _id: string;
    fullName: string;
    email: string;
    createdAt: string;
    status: AdminAdmissionStatus;
    program: string;
}

export interface GetAdmissionsResponseDTO {
    admissions: AdmissionResponseDTO[];
    totalAdmissions: number;
    totalPages: number;
    currentPage: number;
}

/**
 * Response DTO for getting admission by ID
 * Extends FullAdmissionDetails with computed/derived fields
 */
export interface GetAdmissionByIdResponseDTO extends FullAdmissionDetails {
    blocked: boolean; // Computed field - user's blocked status
}

export interface GetAdmissionByTokenResponseDTO {
    admission: AdminAdmission;
}

export interface ApproveAdmissionResponseDTO {
    message: string;
}

export interface RejectAdmissionResponseDTO {
    message: string;
}

export interface DeleteAdmissionResponseDTO {
    message: string;
}

export interface ConfirmAdmissionOfferResponseDTO {
    message: string;
}

export interface ResponseDTO<T> {
    data: T | { error: string };
    success: boolean;
}