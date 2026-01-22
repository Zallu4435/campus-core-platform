import { IAdmissionRepository } from "../../../application/admin/repositories/IAdmissionRepository";
import { Admission as AdmissionModel } from '../../database/mongoose/admission/AdmissionModel';
import { Register as RegisterModel } from "../../database/mongoose/auth/register.model";
import { User as UserModel } from "../../database/mongoose/auth/user.model";
import { ProgramModel } from "../../database/mongoose/academic/studentProgram.model";
import { AdminAdmission, FullAdmissionDetails } from "../../../domain/admin/entities/AdminAdmissionTypes";
import { AdminAdmissionNotFoundError, AdminAdmissionAlreadyProcessedError, AdminInvalidTokenError, AdminTokenExpiredError, AdminRegisterUserNotFoundError } from "../../../domain/admin/errors/AdminAdmissionErrors";
import { User } from "../../../domain/auth/entities/Auth";
import { IAdmissionMapper } from "../../../application/admin/interfaces/IAdmissionMapper";
import { AdmissionStatus, RejectedBy } from "../../../domain/admission/entities/AdmissionTypes";
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
        // Since we are using Mongoose, we might need the original document to save
        // or we can use updateOne. For simplicity if it's already a document:
        if ((admission as any).save) {
            const saved = await (admission as any).save();
            return this._mapper.toDomain(saved) as AdminAdmission;
        }

        const updated = await AdmissionModel.findByIdAndUpdate(
            admission.id,
            this._mapper.toPersistence(admission),
            { new: true }
        ).lean();

        if (!updated) throw new AdminAdmissionNotFoundError();
        return this._mapper.toDomain(updated) as AdminAdmission;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        // This is a leak of Auth domain into Admin repo, but keeping for now as per current design
        const user = await UserModel.findOne({ email }).lean();
        return user as unknown as User;
    }

    async saveUser(user: User): Promise<User> {
        if ((user as any).save) {
            return (user as any).save();
        }
        const updated = await UserModel.findByIdAndUpdate((user as any).id || (user as any)._id, user, { new: true }).lean();
        return updated as unknown as User;
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

    async confirmAdmissionOffer(admissionId: string, token: string, action: string): Promise<any> {
        const admission = await AdmissionModel.findById(admissionId);
        if (!admission) {
            throw new AdminAdmissionNotFoundError();
        }
        if (admission.status !== AdmissionStatus.OFFERED) {
            throw new AdminAdmissionAlreadyProcessedError();
        }
        if (!admission.confirmationToken || admission.confirmationToken !== token) {
            throw new AdminInvalidTokenError();
        }
        if (!admission.tokenExpiry || new Date() > admission.tokenExpiry) {
            throw new AdminTokenExpiredError();
        }

        if (action === "accept") {
            admission.status = AdmissionStatus.APPROVED;
            (admission as any).rejectedBy = undefined;

            const registerUser = await RegisterModel.findById(admission.registerId);
            if (!registerUser) {
                throw new AdminRegisterUserNotFoundError();
            }

            const fullNameParts = (admission.personal.fullName as string).split(" ");
            const firstName = fullNameParts[0];
            const lastName = fullNameParts.slice(1).join(" ") || "";

            const user = new UserModel({
                firstName,
                lastName,
                email: admission.personal.emailAddress,
                password: registerUser.password,
                createdAt: new Date(),
            });

            await user.save();

            let degree = "";
            let catalogYear = "";

            const currentYear = new Date().getFullYear();
            const yearRange = `${currentYear}-${currentYear + 4}`;

            if (admission.choiceOfStudy && admission.choiceOfStudy.length > 0) {
                degree = (admission.choiceOfStudy[0]?.programme as string) || "";
                catalogYear = (admission.choiceOfStudy[0]?.catalogYear as string) || yearRange;
            }

            if (degree && catalogYear) {
                await ProgramModel.create({
                    studentId: user._id,
                    degree,
                    catalogYear,
                    credits: 20,
                });
            }

        } else {
            admission.status = AdmissionStatus.REJECTED;
            admission.rejectedBy = RejectedBy.USER;
        }

        admission.confirmationToken = undefined;
        admission.tokenExpiry = undefined;
        await admission.save();

        return {
            message: action === "accept"
                ? "Admission accepted and user account created"
                : "Admission offer rejected",
        };
    }
}