import { Profile, UserProfileData } from "../../../domain/profile/entities";

export interface IProfileMapper {
    /**
     * Map raw data (usually from database) to domain entity
     */
    toDomain(raw: unknown, isFaculty?: boolean): Profile;

    /**
     * Map domain entity to persistence-ready data
     */
    toPersistence(domain: Profile): UserProfileData;
}
// Verification Comment: Barrel export should resolve indexing issues.
