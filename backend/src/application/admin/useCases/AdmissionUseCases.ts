import {
    GetAdmissionsRequestDTO,
    GetAdmissionByIdRequestDTO,
    GetAdmissionByTokenRequestDTO,
    ApproveAdmissionRequestDTO,
    RejectAdmissionRequestDTO,
    DeleteAdmissionRequestDTO,
    ConfirmAdmissionOfferRequestDTO,
} from "../../../domain/admin/dtos/AdmissionRequestDTOs";
import {
    GetAdmissionsResponseDTO,
    GetAdmissionByIdResponseDTO,
    GetAdmissionByTokenResponseDTO,
    ApproveAdmissionResponseDTO,
    RejectAdmissionResponseDTO,
    DeleteAdmissionResponseDTO,
    ConfirmAdmissionOfferResponseDTO,
    ResponseDTO
} from "../../../domain/admin/dtos/AdmissionResponseDTOs";
import { IAdmissionRepository } from "../repositories/IAdmissionRepository";
import { IEmailService } from "../../auth/service/IEmailService";
import {
    AdminAdmissionNotFoundError,
    AdminAdmissionAlreadyProcessedError,
    AdminRegisterUserNotFoundError,
    AdminTokenExpiredError,
    AdminInvalidTokenError,
} from '../../../domain/admin/errors/AdminAdmissionErrors';
import { AdminAdmissionStatus } from "../../../domain/admin/entities/AdminAdmissionTypes";
import { User } from "../../../domain/auth/entities/Auth";
import {
    IGetAdmissionsUseCase,
    IGetAdmissionByIdUseCase,
    IGetAdmissionByTokenUseCase,
    IApproveAdmissionUseCase,
    IRejectAdmissionUseCase,
    IDeleteAdmissionUseCase,
    IConfirmAdmissionOfferUseCase,
    IBlockAdmissionUseCase
} from './IAdmissionUseCases';

export class GetAdmissionsUseCase implements IGetAdmissionsUseCase {
    constructor(private _repo: IAdmissionRepository) { }

    async execute(p: GetAdmissionsRequestDTO): Promise<ResponseDTO<GetAdmissionsResponseDTO>> {
        const filter: Record<string, unknown> = {};

        if (p.status && !p.status.startsWith("all")) {
            filter.status = p.status === "approved"
                ? { $in: ["approved", "offered"] }
                : p.status;
        }

        if (p.program && !p.program.startsWith("all")) {
            const prog = p.program
                .toLowerCase()
                .replace(/_/g, " ")
                .replace(/\b\w/g, l => l.toUpperCase());

            filter.choiceOfStudy = {
                $elemMatch: { programme: { $regex: `^${prog}$`, $options: "i" } },
            };
        }

        if (p.dateRange && !p.dateRange.startsWith("all")) {
            const now = new Date();
            const days = { last_week: 7, last_month: 30, last_3_months: 90 }[p.dateRange];
            if (days) {
                filter.createdAt = { $gte: new Date(now.getTime() - days * 86_400_000) };
            } else if (p.dateRange === "custom" && p.startDate && p.endDate) {
                const from = new Date(p.startDate);
                const to = new Date(p.endDate);
                to.setHours(23, 59, 59, 999);
                filter.createdAt = { $gte: from, $lte: to };
            }
        }

        if (p.search?.trim()) {
            const q = p.search.trim();
            filter.$or = [
                { "personal.fullName": { $regex: q, $options: "i" } },
                { "personal.emailAddress": { $regex: q, $options: "i" } },
            ];
        }

        const skip = (p.page - 1) * p.limit;
        const proj = {
            _id: 1,
            "personal.fullName": 1,
            "personal.emailAddress": 1,
            createdAt: 1,
            status: 1,
            choiceOfStudy: 1,
        };

        const [rawAdmissions, total] = await Promise.all([
            this._repo.find(filter, proj, skip, p.limit),
            this._repo.count(filter),
        ]);

        const admissions = await Promise.all(
            rawAdmissions.map(async (a) => {
                const email = a.personal?.emailAddress;
                const user = email ? await this._repo.findUserByEmail(email) : null;
                return {
                    _id: a._id.toString(),
                    fullName: a.personal?.fullName ?? "N/A",
                    email: email ?? "N/A",
                    createdAt: new Date(a.createdAt).toISOString(),
                    status: (a.status ?? "pending") as AdminAdmissionStatus,
                    program: a.choiceOfStudy?.[0]?.programme ?? "N/A",
                    blocked: (user as User)?.blocked ?? false,
                };
            })
        );

        return {
            data: {
                admissions,
                totalAdmissions: total,
                totalPages: Math.ceil(total / p.limit),
                currentPage: p.page,
            },
            success: true,
        };
    }
}


export class GetAdmissionByIdUseCase implements IGetAdmissionByIdUseCase {
    constructor(private _admissionRepository: IAdmissionRepository) { }

    async execute(params: GetAdmissionByIdRequestDTO): Promise<ResponseDTO<GetAdmissionByIdResponseDTO>> {
        const admission = await this._admissionRepository.getAdmissionById(params.id);
        if (!admission) {
            throw new AdminAdmissionNotFoundError();
        }
        let blocked = false;
        if (admission.personal?.emailAddress) {
            const user = await this._admissionRepository.findUserByEmail(admission.personal.emailAddress);
            blocked = user?.blocked ?? false;
        }
        return { data: { ...admission, blocked }, success: true };
    }
}

export class GetAdmissionByTokenUseCase implements IGetAdmissionByTokenUseCase {
    constructor(private _admissionRepository: IAdmissionRepository) { }

    async execute(params: GetAdmissionByTokenRequestDTO): Promise<ResponseDTO<GetAdmissionByTokenResponseDTO>> {
        const admission = await this._admissionRepository.getAdmissionByToken(params.admissionId, params.token);
        if (!admission) {
            throw new AdminAdmissionNotFoundError();
        }
        if (admission.status !== "offered") {
            throw new AdminAdmissionAlreadyProcessedError();
        }
        if (!admission.confirmationToken || admission.confirmationToken !== params.token) {
            throw new AdminInvalidTokenError();
        }
        if (!admission.tokenExpiry || new Date() > admission.tokenExpiry) {
            throw new AdminTokenExpiredError();
        }
        return { data: { admission }, success: true };
    }
}

export class ApproveAdmissionUseCase implements IApproveAdmissionUseCase {
    constructor(
        private _admissionRepository: IAdmissionRepository,
        private _emailService: IEmailService,
        private _config
    ) { }

    async execute(params: ApproveAdmissionRequestDTO): Promise<ResponseDTO<ApproveAdmissionResponseDTO>> {
        const admission = await this._admissionRepository.findAdmissionById(params.id);
        if (!admission) throw new AdminAdmissionNotFoundError();
        if (admission.status !== "pending") throw new AdminAdmissionAlreadyProcessedError();

        const confirmationToken = this.generateConfirmationToken();
        admission.confirmationToken = confirmationToken;
        admission.tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        admission.status = "offered";

        await this._admissionRepository.saveAdmission(admission);

        const acceptUrl = `${this._config.frontendUrl}/confirm-admission/${params.id}/accept?token=${confirmationToken}`;
        const rejectUrl = `${this._config.frontendUrl}/confirm-admission/${params.id}/reject?token=${confirmationToken}`;

        await this._emailService.sendAdmissionOfferEmail({
            to: admission.personal.emailAddress,
            name: admission.personal.fullName,
            programDetails: params.additionalInfo?.programDetails || "",
            startDate: admission.createdAt?.toDateString?.() || "",
            scholarshipInfo: params.additionalInfo?.scholarshipInfo || "",
            additionalNotes: params.additionalInfo?.additionalNotes || "",
            acceptUrl,
            rejectUrl,
            expiryDays: 7,
        });

        return { data: { message: "Admission offer email sent" }, success: true };
    }

    private generateConfirmationToken(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}

export class RejectAdmissionUseCase implements IRejectAdmissionUseCase {
    constructor(private _admissionRepository: IAdmissionRepository) { }

    async execute(params: RejectAdmissionRequestDTO): Promise<ResponseDTO<RejectAdmissionResponseDTO>> {
        const admission = await this._admissionRepository.findAdmissionById(params.id);
        if (!admission) throw new AdminAdmissionNotFoundError();
        if (admission.status !== "pending") throw new AdminAdmissionAlreadyProcessedError();

        admission.status = "rejected";
        admission.rejectedBy = "admin";

        await this._admissionRepository.saveAdmission(admission);

        return { data: { message: "Admission rejected" }, success: true };
    }
}

export class DeleteAdmissionUseCase implements IDeleteAdmissionUseCase {
    constructor(private admissionRepository: IAdmissionRepository) { }

    async execute(params: DeleteAdmissionRequestDTO): Promise<ResponseDTO<DeleteAdmissionResponseDTO>> {
        const success = await this.admissionRepository.deleteAdmission(params.id);
        if (!success) {
            throw new AdminAdmissionNotFoundError();
        }
        return { data: { message: "Admission deleted successfully" }, success: true };
    }
}

export class ConfirmAdmissionOfferUseCase implements IConfirmAdmissionOfferUseCase {
    constructor(private _admissionRepository: IAdmissionRepository) { }

    async execute(params: ConfirmAdmissionOfferRequestDTO): Promise<ResponseDTO<ConfirmAdmissionOfferResponseDTO>> {
        const result = await this._admissionRepository.confirmAdmissionOffer(params.admissionId, params.token, params.action);
        if (!result) {
            throw new AdminAdmissionNotFoundError();
        }
        return { data: result, success: true };
    }
}

export class BlockAdmissionUseCase implements IBlockAdmissionUseCase {
    constructor(private _admissionRepository: IAdmissionRepository) { }

    async execute(params: { id: string }): Promise<ResponseDTO<{ message: string }>> {
        const admission = await this._admissionRepository.findAdmissionById(params.id);
        if (!admission) {
            throw new AdminAdmissionNotFoundError();
        }
        const user = await this._admissionRepository.findUserByEmail(admission.personal.emailAddress);
        if (!user) {
            throw new AdminRegisterUserNotFoundError();
        }
        if (user.blocked) {
            user.unblock();
        } else {
            user.block();
        }
        await this._admissionRepository.saveUser(user);
        return {
            data: { message: user.blocked ? 'User blocked' : 'User unblocked' },
            success: true,
        };
    }
}