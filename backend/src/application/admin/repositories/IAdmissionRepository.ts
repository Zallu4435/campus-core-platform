import { AdminAdmission, FullAdmissionDetails } from "../../../domain/admin/entities/AdminAdmissionTypes";
import { User } from "../../../domain/auth/entities/Auth";
import { AdmissionFilter, AdmissionProjection } from "../types/RepositoryTypes";

export interface IAdmissionRepository {
  find(filter: AdmissionFilter, projection: AdmissionProjection, skip: number, limit: number): Promise<AdminAdmission[]>;
  count(filter: AdmissionFilter): Promise<number>;
  getAdmissionById(id: string): Promise<FullAdmissionDetails | null>;
  getAdmissionByToken(admissionId: string, token: string): Promise<FullAdmissionDetails | null>;
  deleteAdmission(id: string): Promise<boolean>;
  confirmAdmissionOffer(admissionId: string, token: string, action: string): Promise<{ message: string } | null>;
  findAdmissionById(id: string): Promise<FullAdmissionDetails | null>;
  saveAdmission(admission: AdminAdmission): Promise<AdminAdmission>;
  findUserByEmail(email: string): Promise<User | null>;
  saveUser(user: User): Promise<User>;
}