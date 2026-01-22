/**
 * ID Generator Service Interface
 * Abstraction for generating unique identifiers
 * This keeps infrastructure concerns (uuid library) out of the application layer
 */
export interface IIdGeneratorService {
    /**
     * Generate a unique identifier
     * @returns A unique string identifier
     */
    generate(): string;

    /**
     * Validate if a string is a valid ID format
     * @param id - The ID to validate
     * @returns true if valid, false otherwise
     */
    isValid(id: string): boolean;
}
