import { IAdmissionRepository } from "../../../application/admin/repositories/IAdmissionRepository";
import { Admission as AdmissionModel } from '../../database/mongoose/admission/AdmissionModel';
import { Register as RegisterModel } from "../../database/mongoose/auth/register.model";
import { AdminAdmission, FullAdmissionDetails } from "../../../domain/admin/entities/AdminAdmissionTypes";
import { AdminAdmissionNotFoundError, AdminAdmissionAlreadyProcessedError } from "../../../domain/admin/errors/AdminAdmissionErrors";
import { IAdmissionMapper } from "../../../application/admin/interfaces/IAdmissionMapper";
import { AdmissionStatus } from "../../../domain/admission/entities/AdmissionTypes";
import { AdmissionFilter, AdmissionProjection } from "../../../application/admin/types/RepositoryTypes";

export class AdmissionRepository implements IAdmissionRepository {
    constructor(private _mapper: IAdmissionMapper) { }

    async find(filter: AdmissionFilter, projection: AdmissionProjection, skip: number, limit: number): Promise<AdminAdmission[]> {
        const results = await AdmissionModel.find(filter)
            .select(projection)
            .sort({ updatedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean({ getters: true });

        return results.map(r => this._mapper.toDomain(r) as AdminAdmission);
    }

    async count(filter: AdmissionFilter): Promise<number> {
        return AdmissionModel.countDocuments(filter);
    }

    async getAdmissionById(id: string): Promise<FullAdmissionDetails | null> {
        const admission = await AdmissionModel.findById(id).lean();
        if (!admission) return null;
        return this._mapper.toDomain(admission) as FullAdmissionDetails;
    }

    async getAdmissionByToken(admissionId: string, token: string): Promise<FullAdmissionDetails | null> {
        const admission = await AdmissionModel.findById(admissionId)
            .select("personal choiceOfStudy status confirmationToken tokenExpiry")
            .lean();

        if (!admission) return null;
        return this._mapper.toDomain(admission) as FullAdmissionDetails;
    }

    async findAdmissionById(id: string): Promise<FullAdmissionDetails | null> {
        const admission = await AdmissionModel.findById(id).lean();
        if (!admission) return null;
        return this._mapper.toDomain(admission) as FullAdmissionDetails;
    }

    async saveAdmission(admission: AdminAdmission): Promise<AdminAdmission> {
        const updated = await AdmissionModel.findByIdAndUpdate(
            admission.id,
            this._mapper.toPersistence(admission),
            { new: true }
        ).lean();

        if (!updated) throw new AdminAdmissionNotFoundError();
        return this._mapper.toDomain(updated) as AdminAdmission;
    }

    async findRegisterUserById(registerId: string): Promise<{ password: string } | null> {
        const user = await RegisterModel.findById(registerId).select('password').lean();
        if (!user) return null;
        return { password: user.password };
    }

    async deleteAdmission(id: string): Promise<boolean> {
        const admission = await AdmissionModel.findById(id);
        if (!admission) {
            throw new AdminAdmissionNotFoundError();
        }
        if (admission.status !== AdmissionStatus.PENDING) {
            throw new AdminAdmissionAlreadyProcessedError();
        }

        const result = await AdmissionModel.deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}