/**
 * Generic Response DTO
 * Used across all campus-life use cases
 */
export interface ResponseDTO<T> {
    success: boolean;
    data: T | { error: string };
}
