import { IAdmissionMapper } from "../../../application/admin/interfaces/IAdmissionMapper";
import { AdminAdmission, FullAdmissionDetails, AdminAdmissionStatus } from "../../../domain/admin/entities/AdminAdmissionTypes";
import { AdmissionRawData, AdmissionPersistenceData } from "../../../application/admin/types/RepositoryTypes";
import { AdmissionResponseDTO, GetAdmissionByIdResponseDTO } from "../../../application/admin/dtos/AdmissionResponseDTOs";
import { IAdmissionSource } from "./infraTypes";

export class AdmissionMapper implements IAdmissionMapper {
    toDomain(raw: AdmissionRawData): AdminAdmission | FullAdmissionDetails {
        const source = raw as unknown as IAdmissionSource;
        const domain: AdminAdmission = {
            id: source._id?.toString() || (source.id as string) || "",
            registerId: source.registerId ? source.registerId.toString() : "",
            applicationId: source.applicationId || "",
            personal: {
                fullName: source.personal?.fullName || "",
                emailAddress: source.personal?.emailAddress || "",
                phoneNumber: source.personal?.phoneNumber,
                dateOfBirth: source.personal?.dateOfBirth,
                gender: source.personal?.gender,
                nationality: source.personal?.nationality
            },
            choiceOfStudy: Array.isArray(source.choiceOfStudy) ? source.choiceOfStudy.map((c) => ({
                programme: c.programme || "",
                degree: c.degree,
                catalogYear: c.catalogYear
            })) : [],
            education: source.education || {},
            achievements: source.achievements || {},
            otherInformation: source.otherInformation || {},
            documents: {
                documents: Array.isArray(source.documents?.documents) ? source.documents!.documents!.map((d) => ({
                    id: d.id,
                    fileName: d.fileName,
                    fileType: d.fileType,
                    url: d.url || d.cloudinaryUrl,
                    path: d.path,
                    uploadedAt: d.uploadedAt instanceof Date ? d.uploadedAt : new Date(d.uploadedAt || Date.now())
                })) : [],
            },
            declaration: source.declaration || {},
            paymentId: source.paymentId ? source.paymentId.toString() : "",
            status: (source.status as AdminAdmissionStatus) || AdminAdmissionStatus.Pending,
            confirmationToken: source.confirmationToken,
            tokenExpiry: source.tokenExpiry instanceof Date ? source.tokenExpiry : (source.tokenExpiry ? new Date(source.tokenExpiry) : undefined),
            rejectedBy: source.rejectedBy,
            createdAt: source.createdAt instanceof Date ? source.createdAt : new Date(source.createdAt || Date.now()),
            updatedAt: source.updatedAt instanceof Date ? source.updatedAt : new Date(source.updatedAt || Date.now())
        };
        return domain;
    }

    toDTO(domain: AdminAdmission | FullAdmissionDetails, blocked?: boolean): AdmissionResponseDTO | GetAdmissionByIdResponseDTO {
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
                createdAt: domain.createdAt,
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
