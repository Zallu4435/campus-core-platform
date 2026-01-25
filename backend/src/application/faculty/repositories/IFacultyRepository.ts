import { Faculty } from "../../../domain/faculty/entities/Faculty";
import { FacultyStatus } from "../../../domain/faculty/enums/FacultyEnums";

export interface IFacultyFilters {
    status?: FacultyStatus;
    department?: string;
    createdAt?: {
        start?: Date;
        end?: Date;
    };
    search?: string;
}

export interface IFacultyRepository {
    findFaculty(filters: IFacultyFilters, options: { skip?: number; limit?: number; select?: string }): Promise<Faculty[]>;
    countFaculty(filters: IFacultyFilters): Promise<number>;
    getFacultyById(id: string): Promise<Faculty | null>;
    getFacultyByToken(token: string): Promise<Faculty | null>;
    updateFaculty(faculty: Faculty): Promise<Faculty>;
    deleteFaculty(id: string): Promise<boolean>;
    saveFaculty(faculty: Faculty): Promise<Faculty>;
    blockFaculty(id: string): Promise<boolean>;
    createFacultyAccount(data: { firstName: string; lastName: string; email: string; password?: string }): Promise<void>;
}