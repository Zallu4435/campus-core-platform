// ProfileMapper.ts
import { IProfileMapper } from "../../../application/profile/interfaces/IProfileMapper";
import { Profile, UserProfileData, ProfileRole } from "../../../domain/profile/entities";
import { IProfileSource } from "./infraTypes";

export class ProfileMapper implements IProfileMapper {
    toDomain(raw: IProfileSource | null, isFaculty: boolean = false): Profile {
        if (!raw) {
            throw new Error("Cannot map null document to domain entity");
        }
        const doc = raw;

        return Profile.create({
            id: (doc._id || (doc as any).id || '').toString(),
            firstName: doc.firstName || (doc as any).fullName?.split(' ')[0] || '',
            lastName: doc.lastName || (doc as any).fullName?.split(' ').slice(1).join(' ') || '',
            email: doc.email,
            phone: doc.phone as string,
            profilePicture: (doc as any).profilePicture,
            passwordChangedAt: (doc as any).passwordChangedAt,
            password: doc.password,
            role: isFaculty ? ProfileRole.Faculty : ((doc as any).role || ProfileRole.Student),
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
