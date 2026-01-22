// IUserService.ts
/**
 * Service interface for user-related operations
 * Abstracts Auth domain from Admin domain
 */
export interface IUserService {
    /**
     * Create a new user account
     */
    createUser(params: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }): Promise<{ id: string }>;

    /**
     * Find user by email
     */
    findByEmail(email: string): Promise<{ id: string; blocked: boolean } | null>;

    /**
     * Block/unblock user
     */
    toggleBlock(userId: string): Promise<{ blocked: boolean }>;
}
