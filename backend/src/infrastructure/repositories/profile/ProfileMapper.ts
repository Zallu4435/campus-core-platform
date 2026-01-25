// ProfileMapper.ts
import { IProfileMapper } from "../../../application/profile/interfaces/IProfileMapper";
import { Profile, UserProfileData, ProfileRole } from "../../../domain/profile/entities";
import { IProfileSource } from "./infraTypes";

export class ProfileMapper implements IProfileMapper {
    toDomain(raw: IProfileSource | null, isFaculty: boolean = false): Profile {
        if (!raw) {
            throw new Error("Cannot map null document to domain entity");
        }
        const doc = raw as Record<string, unknown>;

        return Profile.create({
            id: (doc._id || doc.id || '').toString(),
            firstName: (doc.firstName as string | undefined) || (doc.fullName as string | undefined)?.split(' ')[0] || '',
            lastName: (doc.lastName as string | undefined) || (doc.fullName as string | undefined)?.split(' ').slice(1).join(' ') || '',
            email: doc.email as string,
            phone: doc.phone as string,
            profilePicture: doc.profilePicture as string | undefined,
            passwordChangedAt: doc.passwordChangedAt as Date | undefined,
            password: doc.password as string,
            role: isFaculty ? ProfileRole.Faculty : ((doc.role as ProfileRole) || ProfileRole.Student),
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt as string | Date) : undefined
        });
    }

    toPersistence(domain: Profile): UserProfileData {
        return {
            id: domain.id,
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
