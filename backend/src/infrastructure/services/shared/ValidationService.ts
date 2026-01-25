// src/infrastructure/services/shared/ValidationService.ts
import { isValidObjectId } from 'mongoose';
import { IValidationService } from '../../../application/shared/services/IValidationService';

/**
 * Concrete implementation using Mongoose
 */
export class ValidationService implements IValidationService {
    isValidObjectId(id: string): boolean {
        return isValidObjectId(id);
    }

    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const validationService = new ValidationService();
