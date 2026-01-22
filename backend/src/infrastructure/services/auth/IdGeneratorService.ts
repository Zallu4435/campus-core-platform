import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { IIdGeneratorService } from "../../../application/auth/service/IIdGeneratorService";
import Logger from "../../../shared/utils/logger";

/**
 * UUID v4 implementation of IIdGeneratorService
 * Generates unique identifiers using UUID v4
 */
export class UuidGeneratorService implements IIdGeneratorService {
    /**
     * Generate a new UUID v4
     */
    generate(): string {
        const id = uuidv4();
        Logger.debug(`Generated new UUID: ${id}`);
        return id;
    }

    /**
     * Validate if a string is a valid UUID
     */
    isValid(id: string): boolean {
        return uuidValidate(id);
    }
}

// Export singleton instance
export const idGeneratorService = new UuidGeneratorService();
