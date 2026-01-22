// IProfileRepository.ts
import { Profile } from "../../../domain/profile/entities/Profile";

export interface IProfileRepository {
    getProfile(userId: string): Promise<Profile | null>;
    findByEmail(email: string): Promise<Profile | null>; // Search both collections
    save(profile: Profile): Promise<Profile>; // Save to appropriate collection

    // Explicit checks if strictly needed for conflict resolution (e.g. updating email)
    checkEmailExists(email: string): Promise<boolean>;
}