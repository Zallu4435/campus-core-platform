import { DiplomaProps } from '../../../domain/diploma/types';

export interface GetDiplomasRequestDTO {
    page: number;
    limit: number;
    department: string;
    category?: string;
    status: string;
    instructor: string;
    dateRange: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export interface GetDiplomaByIdRequestDTO {
    id: string;
}

export type CreateDiplomaRequestDTO = Pick<DiplomaProps, 'title' | 'description' | 'price' | 'category' | 'thumbnail' | 'duration' | 'prerequisites' | 'status'>;

export type UpdateDiplomaRequestDTO = { id: string } & Partial<Pick<DiplomaProps, 'title' | 'description' | 'price' | 'category' | 'thumbnail' | 'duration' | 'prerequisites' | 'status'>>;

export interface DeleteDiplomaRequestDTO {
    id: string;
}

export interface EnrollStudentRequestDTO {
    diplomaId: string;
    studentId: string;
}

export interface UnenrollStudentRequestDTO {
    diplomaId: string;
    studentId: string;
}
