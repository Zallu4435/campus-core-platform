// IPasswordService.ts
/**
 * Password service interface for abstracting password operations
 * This follows the Dependency Inversion Principle
 */
export interface IPasswordService {
    /**
     * Hash a plain text password
     */
    hash(plainPassword: string): Promise<string>;

    /**
     * Compare a plain text password with a hashed password
     */
    compare(plainPassword: string, hashedPassword: string): Promise<boolean>;

    /**
     * Validate password strength
     */
    validateStrength(password: string): boolean;
}
