// IProgramService.ts
/**
 * Service interface for program enrollment operations
 */
export interface IProgramService {
    /**
     * Enroll student in a program
     */
    enrollStudent(params: {
        studentId: string;
        degree: string;
        catalogYear: string;
        credits?: number;
    }): Promise<void>;
}
