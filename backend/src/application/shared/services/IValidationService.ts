// src/application/shared/services/IValidationService.ts
/**
 * Domain-agnostic validation service
 * Abstracts away infrastructure details (mongoose.isValidObjectId, etc.)
 */
export interface IValidationService {
    isValidObjectId(id: string): boolean;
    isValidEmail(email: string): boolean;
    isValidUrl(url: string): boolean;
}
