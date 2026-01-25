import { Faculty } from "../../../domain/faculty/entities/Faculty";
import { FacultyStatus } from "../../../domain/faculty/enums/FacultyEnums";
import { FacultyRejectedBy } from "../../../domain/faculty/enums/FacultyEnums";
import { IFacultySource } from "./infraTypes";

export class FacultyMapper {
    static toDomain(raw: IFacultySource): Faculty {
        const fullNameParts = raw.fullName.split(" ");
        const firstName = fullNameParts[0] || "";
        const lastName = fullNameParts.slice(1).join(" ") || "";

        return new Faculty({
            id: raw._id.toString(),
            firstName: firstName,
            lastName: lastName,
            email: raw.email,
            phone: raw.phone,
            department: raw.department,
            qualification: raw.qualification,
            experience: String(raw.experience),
            aboutMe: raw.aboutMe,
            cvUrl: raw.cvUrl,
            certificatesUrl: raw.certificatesUrl || [],
            status: raw.status as FacultyStatus,
            rejectedBy: raw.rejectedBy as FacultyRejectedBy,
            confirmationToken: raw.confirmationToken,
            tokenExpiry: raw.tokenExpiry ? new Date(raw.tokenExpiry as string | Date) : undefined,
            blocked: raw.blocked,
            createdAt: raw.createdAt ? new Date(raw.createdAt as string | Date) : new Date(),
            updatedAt: raw.updatedAt ? new Date(raw.updatedAt as string | Date) : new Date(),
            // password is usually not in Register doc, but if it is:
            password: raw.password
        });
    }

    static toPersistence(entity: Faculty): Partial<IFacultySource> {
        return {
            fullName: entity.firstName + " " + entity.lastName, // Combine names for persistence if schema uses fullName
            email: entity.email,
            phone: entity.phone,
            department: entity.department,
            qualification: entity.qualification,
            experience: entity.experience,
            aboutMe: entity.aboutMe,
            cvUrl: entity.cvUrl,
            certificatesUrl: entity.certificatesUrl,
            status: entity.status,
            rejectedBy: entity.rejectedBy,
            confirmationToken: entity.confirmationToken,
            tokenExpiry: entity.tokenExpiry,
            blocked: entity.blocked,
            password: entity.password,
        };
    }
}
