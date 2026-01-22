// IProfileMapper.ts
import { Profile } from "../../../domain/profile/entities/Profile";
import { UserProfilePersistence } from "../../../domain/profile/entities/ProfileTypes";

export interface IProfileMapper {
    /**
     * Converts a raw database document/object to a pure Domain Entity
     */
    toDomain(raw: any, isFaculty?: boolean): Profile;

    /**
     * Converts a Domain Entity to a Persistence object (for saving)
     */
    toPersistence(domain: Profile): UserProfilePersistence;
}
