// ProfileMapper.ts
import { IProfileMapper } from "../../../application/profile/interfaces/IProfileMapper";
import { Profile } from "../../../domain/profile/entities/Profile";
import { UserProfilePersistence, ProfileRole } from "../../../domain/profile/entities/ProfileTypes";

export class ProfileMapper implements IProfileMapper {
    toDomain(raw: any, isFaculty: boolean = false): Profile {
        return Profile.create({
            id: raw._id ? raw._id.toString() : raw.id,
            firstName: raw.firstName,
            lastName: raw.lastName,
            email: raw.email,
            phone: raw.phone,
            profilePicture: raw.profilePicture,
            passwordChangedAt: raw.passwordChangedAt,
            password: raw.password,
            role: isFaculty ? ProfileRole.Faculty : ProfileRole.Student,
            updatedAt: raw.updatedAt
        });
    }

    toPersistence(domain: Profile): UserProfilePersistence {
        return {
            _id: domain.id,
            firstName: domain.firstName,
            lastName: domain.lastName,
            email: domain.email,
            phone: domain.phone,
            profilePicture: domain.profilePicture,
            passwordChangedAt: domain.passwordChangedAt,
            password: domain.password
        };
    }
}
