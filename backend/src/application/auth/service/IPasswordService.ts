/**
 * Password Service Interface
 * Abstraction for password hashing and comparison operations
 * This keeps infrastructure concerns (bcrypt) out of the application layer
 */
export interface IPasswordService {
    /**
     * Hash a plain text password
     * @param plainPassword - The password to hash
     * @returns Promise resolving to the hashed password
     */
    hash(plainPassword: string): Promise<string>;

    /**
     * Compare a plain text password with a hashed password
     * @param plainPassword - The plain text password
     * @param hashedPassword - The hashed password to compare against
     * @returns Promise resolving to true if passwords match, false otherwise
     */
    compare(plainPassword: string, hashedPassword: string): Promise<boolean>;

    /**
     * Validate password strength requirements
     * @param password - The password to validate
     * @returns true if password meets requirements, false otherwise
     */
    meetsRequirements(password: string): boolean;
}
