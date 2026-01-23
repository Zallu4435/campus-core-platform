import { DiplomaProps } from '../../../domain/diploma/types';

export interface DiplomaSummaryDTO {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    thumbnail: string;
    duration: string;
    prerequisites: string[];
    status: boolean;
    createdAt: string;
    updatedAt: string;
    videoIds: string[];
}

export interface GetDiplomasResponseDTO {
    data: DiplomaSummaryDTO[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
}

export interface DiplomaDetailsDTO extends DiplomaProps {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    videoIds: string[];
}

export interface GetDiplomaByIdResponseDTO {
    diploma: DiplomaDetailsDTO;
}

export interface CreateDiplomaResponseDTO {
    diploma: DiplomaDetailsDTO;
}

export interface UpdateDiplomaResponseDTO {
    diploma: DiplomaDetailsDTO;
}

export interface EnrollStudentResponseDTO {
    message: string;
}

export interface UnenrollStudentResponseDTO {
    message: string;
}
