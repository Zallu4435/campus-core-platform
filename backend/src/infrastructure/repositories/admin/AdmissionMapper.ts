// AdmissionMapper.ts
import { IAdmissionMapper } from "../../../application/admin/interfaces/IAdmissionMapper";
import { AdminAdmission, FullAdmissionDetails, AdminAdmissionStatus } from "../../../domain/admin/entities/AdminAdmissionTypes";
import { AdmissionRawData, AdmissionPersistenceData } from "../../../application/admin/types/RepositoryTypes";

export class AdmissionMapper implements IAdmissionMapper {
    toDomain(raw: AdmissionRawData): AdminAdmission | FullAdmissionDetails {
        const domain: AdminAdmission = {
            id: raw._id ? raw._id.toString() : raw.id,
            registerId: raw.registerId?.toString() || "",
            applicationId: raw.applicationId || "",
            personal: {
                fullName: raw.personal?.fullName || "",
                emailAddress: raw.personal?.emailAddress || "",
                phoneNumber: raw.personal?.phoneNumber,
                dateOfBirth: raw.personal?.dateOfBirth,
                gender: raw.personal?.gender,
                nationality: raw.personal?.nationality
            },
            choiceOfStudy: Array.isArray(raw.choiceOfStudy) ? raw.choiceOfStudy.map((c) => ({
                programme: c.programme || "",
                degree: c.degree,
                catalogYear: c.catalogYear
            })) : [],
            education: raw.education || {},
            achievements: raw.achievements || {},
            otherInformation: raw.otherInformation || {},
            documents: {
                documents: Array.isArray(raw.documents?.documents) ? raw.documents.documents.map((d) => ({
                    id: d.id,
                    fileName: d.fileName,
                    fileType: d.fileType,
                    url: d.url,
                    cloudinaryUrl: d.cloudinaryUrl,
                    path: d.path,
                    uploadedAt: d.uploadedAt
                })) : [],
            },
            declaration: raw.declaration || {},
            paymentId: raw.paymentId || "",
            status: (raw.status as AdminAdmissionStatus) || AdminAdmissionStatus.Pending,
            confirmationToken: raw.confirmationToken,
            tokenExpiry: raw.tokenExpiry,
            rejectedBy: raw.rejectedBy,
            createdAt: raw.createdAt || new Date(),
            updatedAt: raw.updatedAt
        };
        return domain;
    }

    toDTO(domain: AdminAdmission | FullAdmissionDetails, blocked?: boolean): any {
        // For list view (GetAdmissions), return simplified DTO
        const baseDTO = {
            _id: domain.id,
            fullName: domain.personal?.fullName || "",
            email: domain.personal?.emailAddress || "",
            createdAt: domain.createdAt.toISOString ? domain.createdAt.toISOString() : domain.createdAt.toString(),
            status: domain.status,
            program: domain.choiceOfStudy?.[0]?.programme || "",
        };

        // For detail view (GetAdmissionById), return full details
        if ('registerId' in domain) {
            return {
                ...domain,
                _id: domain.id,
                createdAt: domain.createdAt.toISOString ? domain.createdAt.toISOString() : domain.createdAt.toString(),
                ...(blocked !== undefined && { blocked })
            };
        }

        return baseDTO;
    }

    toPersistence(domain: AdminAdmission | FullAdmissionDetails): AdmissionPersistenceData {
        return {
            _id: domain.id,
            status: domain.status,
            rejectedBy: domain.rejectedBy,
            confirmationToken: domain.confirmationToken,
            tokenExpiry: domain.tokenExpiry,
            // We generally update specific fields, not full overwrite usually, but if we do:
            personal: domain.personal,
            // ...
        };
    }
}
