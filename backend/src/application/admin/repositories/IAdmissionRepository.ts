import { AdminAdmission, FullAdmissionDetails } from "../../../domain/admin/entities/AdminAdmissionTypes";
import { AdmissionFilter, AdmissionProjection } from "../types/RepositoryTypes";

export interface IAdmissionRepository {
  find(filter: AdmissionFilter, projection: AdmissionProjection, skip: number, limit: number): Promise<AdminAdmission[]>;
  count(filter: AdmissionFilter): Promise<number>;
  getAdmissionById(id: string): Promise<FullAdmissionDetails | null>;
  getAdmissionByToken(admissionId: string, token: string): Promise<FullAdmissionDetails | null>;
  deleteAdmission(id: string): Promise<boolean>;
  findAdmissionById(id: string): Promise<FullAdmissionDetails | null>;
  saveAdmission(admission: AdminAdmission): Promise<AdminAdmission>;
  findRegisterUserById(registerId: string): Promise<{ password: string } | null>;
}