// IAdmissionMapper.ts
import { AdminAdmission, FullAdmissionDetails } from "../../../domain/admin/entities/AdminAdmissionTypes";
import { GetAdmissionsResponseDTO, GetAdmissionByIdResponseDTO, GetAdmissionByTokenResponseDTO } from "../dtos/AdmissionResponseDTOs";
import { AdmissionRawData, AdmissionPersistenceData } from "../types/RepositoryTypes";

export interface IAdmissionMapper {
    toDomain(raw: AdmissionRawData): AdminAdmission | FullAdmissionDetails;
    toDTO(domain: AdminAdmission | FullAdmissionDetails, blocked?: boolean): Record<string, any>;
    toPersistence(domain: AdminAdmission | FullAdmissionDetails): AdmissionPersistenceData;
}
