import { FacultyStatus } from '../../../domain/faculty/enums/FacultyEnums';

export interface FacultyResponseDTO {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    department?: string;
    qualification?: string;
    experience?: string;
    aboutMe?: string;
    cvUrl?: string;
    certificatesUrl?: string[];
    createdAt: string;
    status: FacultyStatus;
    blocked?: boolean;
}

export interface GetFacultyResponseDTO {
    faculty: FacultyResponseDTO[];
    totalFaculty: number;
    totalPages: number;
    currentPage: number;
}

export interface GetFacultyByIdResponseDTO {
    faculty: FacultyResponseDTO;
}

export interface GetFacultyByTokenResponseDTO {
    faculty: FacultyResponseDTO;
}

export interface ApproveFacultyResponseDTO {
    message: string;
}

export interface RejectFacultyResponseDTO {
    message: string;
}

export interface DeleteFacultyResponseDTO {
    message: string;
}

export interface ConfirmFacultyOfferResponseDTO {
    message: string;
}

export interface DownloadCertificateResponseDTO {
    fileStream: NodeJS.ReadableStream;
    fileSize: number;
    fileName: string;
}
