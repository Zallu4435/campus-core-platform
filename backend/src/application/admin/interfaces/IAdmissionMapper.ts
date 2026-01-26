// IAdmissionMapper.ts
import { AdminAdmission, FullAdmissionDetails } from "../../../domain/admin/entities/AdminAdmissionTypes";
import { AdmissionResponseDTO, GetAdmissionByIdResponseDTO } from "../dtos/AdmissionResponseDTOs";
import { AdmissionRawData, AdmissionPersistenceData } from "../types/RepositoryTypes";

export interface IAdmissionMapper {
    toDomain(raw: AdmissionRawData): AdminAdmission | FullAdmissionDetails;
    toDTO(domain: AdminAdmission | FullAdmissionDetails, blocked?: boolean, viewType?: 'list' | 'detail'): AdmissionResponseDTO | GetAdmissionByIdResponseDTO;
    toPersistence(domain: AdminAdmission | FullAdmissionDetails): AdmissionPersistenceData;
}
