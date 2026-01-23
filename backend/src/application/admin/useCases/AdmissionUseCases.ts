import {
    GetAdmissionsRequestDTO,
    GetAdmissionByIdRequestDTO,
    GetAdmissionByTokenRequestDTO,
    ApproveAdmissionRequestDTO,
    RejectAdmissionRequestDTO,
    DeleteAdmissionRequestDTO,
    ConfirmAdmissionOfferRequestDTO,
} from "../dtos/AdmissionRequestDTOs";
import {
    GetAdmissionsResponseDTO,
    GetAdmissionByIdResponseDTO,
    GetAdmissionByTokenResponseDTO,
    ApproveAdmissionResponseDTO,
    RejectAdmissionResponseDTO,
    DeleteAdmissionResponseDTO,
    ConfirmAdmissionOfferResponseDTO,
    AdmissionResponseDTO
} from "../dtos/AdmissionResponseDTOs";
import { IAdmissionRepository } from "../repositories/IAdmissionRepository";
import { IEmailService } from "../../auth/service/IEmailService";
import { IUserService } from "../services/IUserService";
import { IProgramService } from "../services/IProgramService";
import {
    AdminAdmissionNotFoundError,
    AdminAdmissionAlreadyProcessedError,
    AdminRegisterUserNotFoundError,
    AdminTokenExpiredError,
    AdminInvalidTokenError,
} from '../../../domain/admin/errors/AdminAdmissionErrors';
import { AdminAdmissionStatus } from "../../../domain/admin/entities/AdminAdmissionTypes";
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
import { AdminConstants } from "../constants/AdminConstants";
import { IAdmissionMapper } from "../interfaces/IAdmissionMapper";
import { AppConfig } from "../types/RepositoryTypes";

export class GetAdmissionsUseCase implements IGetAdmissionsUseCase {
    constructor(
        private _repo: IAdmissionRepository,
        private _mapper: IAdmissionMapper,
        private _userService: IUserService
    ) { }

    async execute(p: GetAdmissionsRequestDTO): Promise<GetAdmissionsResponseDTO> {
        const filter: Record<string, any> = {};

        if (p.status && p.status !== "all") {
            filter.status = p.status === AdminAdmissionStatus.Approved
                ? { $in: [AdminAdmissionStatus.Approved, AdminAdmissionStatus.Offered] }
                : p.status;
        }

        if (p.program && p.program !== "all") {
            const prog = p.program
                .toLowerCase()
                .replace(/_/g, " ")
                .replace(/\b\w/g, l => l.toUpperCase());

            filter.choiceOfStudy = {
                $elemMatch: { programme: { $regex: `^${prog}$`, $options: "i" } },
            };
        }

        if (p.dateRange && p.dateRange !== "all") {
            const now = new Date();
            const days = AdminConstants.FILTER_RANGES[p.dateRange.toUpperCase() as keyof typeof AdminConstants.FILTER_RANGES];

            if (days) {
                filter.createdAt = { $gte: new Date(now.getTime() - days * 24 * 60 * 60 * 1000) };
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
        } as const;

        const [rawAdmissions, total] = await Promise.all([
            this._repo.find(filter, proj, skip, p.limit),
            this._repo.count(filter),
        ]);

        const admissions = await Promise.all(
            rawAdmissions.map(async (a) => {
                const email = a.personal?.emailAddress;
                const user = email ? await this._userService.findByEmail(email) : null;
                const domain = this._mapper.toDomain(a);
                return this._mapper.toDTO(domain, user?.blocked ?? false);
            })
        );

        return {
            admissions: admissions as AdmissionResponseDTO[],
            totalAdmissions: total,
            totalPages: Math.ceil(total / p.limit),
            currentPage: p.page,
        };
    }
}


export class GetAdmissionByIdUseCase implements IGetAdmissionByIdUseCase {
    constructor(
        private _admissionRepository: IAdmissionRepository,
        private _mapper: IAdmissionMapper,
        private _userService: IUserService
    ) { }

    async execute(params: GetAdmissionByIdRequestDTO): Promise<GetAdmissionByIdResponseDTO> {
        const admission = await this._admissionRepository.getAdmissionById(params.id);
        if (!admission) {
            throw new AdminAdmissionNotFoundError();
        }

        let blocked = false;
        if (admission.personal?.emailAddress) {
            const user = await this._userService.findByEmail(admission.personal.emailAddress);
            blocked = user?.blocked ?? false;
        }

        return this._mapper.toDTO(admission, blocked) as GetAdmissionByIdResponseDTO;
    }
}

export class GetAdmissionByTokenUseCase implements IGetAdmissionByTokenUseCase {
    constructor(
        private _admissionRepository: IAdmissionRepository,
        private _mapper: IAdmissionMapper
    ) { }

    async execute(params: GetAdmissionByTokenRequestDTO): Promise<GetAdmissionByTokenResponseDTO> {
        const admission = await this._admissionRepository.getAdmissionByToken(params.admissionId, params.token);
        if (!admission) {
            throw new AdminAdmissionNotFoundError();
        }

        if (admission.status !== AdminAdmissionStatus.Offered) {
            throw new AdminAdmissionAlreadyProcessedError();
        }

        if (!admission.confirmationToken || admission.confirmationToken !== params.token) {
            throw new AdminInvalidTokenError();
        }

        if (!admission.tokenExpiry || new Date() > admission.tokenExpiry) {
            throw new AdminTokenExpiredError();
        }

        return { admission };
    }
}

export class ApproveAdmissionUseCase implements IApproveAdmissionUseCase {
    constructor(
        private _admissionRepository: IAdmissionRepository,
        private _emailService: IEmailService,
        private _config: AppConfig
    ) { }

    async execute(params: ApproveAdmissionRequestDTO): Promise<ApproveAdmissionResponseDTO> {
        const admission = await this._admissionRepository.findAdmissionById(params.id);
        if (!admission) throw new AdminAdmissionNotFoundError();
        if (admission.status !== AdminAdmissionStatus.Pending) throw new AdminAdmissionAlreadyProcessedError();

        const confirmationToken = this.generateConfirmationToken();
        admission.confirmationToken = confirmationToken;
        admission.tokenExpiry = new Date(Date.now() + AdminConstants.EMAIL.EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        admission.status = AdminAdmissionStatus.Offered;

        await this._admissionRepository.saveAdmission(admission);

        const acceptUrl = `${this._config.frontendUrl}/confirm-admission/${params.id}/accept?token=${confirmationToken}`;
        const rejectUrl = `${this._config.frontendUrl}/confirm-admission/${params.id}/reject?token=${confirmationToken}`;

        await this._emailService.sendAdmissionOfferEmail({
            to: admission.personal.emailAddress,
            name: admission.personal.fullName,
            programDetails: params.additionalInfo?.programDetails || "",
            startDate: admission.createdAt ? new Date(admission.createdAt).toDateString() : "",
            scholarshipInfo: params.additionalInfo?.scholarshipInfo || "",
            additionalNotes: params.additionalInfo?.additionalNotes || "",
            acceptUrl,
            rejectUrl,
            expiryDays: AdminConstants.EMAIL.EXPIRY_DAYS,
        });

        return { message: "Admission offer email sent" };
    }

    private generateConfirmationToken(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}

export class RejectAdmissionUseCase implements IRejectAdmissionUseCase {
    constructor(private _admissionRepository: IAdmissionRepository) { }

    async execute(params: RejectAdmissionRequestDTO): Promise<RejectAdmissionResponseDTO> {
        const admission = await this._admissionRepository.findAdmissionById(params.id);
        if (!admission) throw new AdminAdmissionNotFoundError();
        if (admission.status !== AdminAdmissionStatus.Pending) throw new AdminAdmissionAlreadyProcessedError();

        admission.status = AdminAdmissionStatus.Rejected;
        admission.rejectedBy = "admin";

        await this._admissionRepository.saveAdmission(admission);

        return { message: "Admission rejected" };
    }
}

export class DeleteAdmissionUseCase implements IDeleteAdmissionUseCase {
    constructor(private admissionRepository: IAdmissionRepository) { }

    async execute(params: DeleteAdmissionRequestDTO): Promise<DeleteAdmissionResponseDTO> {
        const success = await this.admissionRepository.deleteAdmission(params.id);
        if (!success) {
            throw new AdminAdmissionNotFoundError();
        }
        return { message: "Admission deleted successfully" };
    }
}

export class ConfirmAdmissionOfferUseCase implements IConfirmAdmissionOfferUseCase {
    constructor(
        private _admissionRepository: IAdmissionRepository,
        private _userService: IUserService,
        private _programService: IProgramService
    ) { }

    async execute(params: ConfirmAdmissionOfferRequestDTO): Promise<ConfirmAdmissionOfferResponseDTO> {
        const admission = await this._admissionRepository.getAdmissionByToken(params.admissionId, params.token);
        if (!admission) {
            throw new AdminAdmissionNotFoundError();
        }

        if (admission.status !== AdminAdmissionStatus.Offered) {
            throw new AdminAdmissionAlreadyProcessedError();
        }

        if (!admission.confirmationToken || admission.confirmationToken !== params.token) {
            throw new AdminInvalidTokenError();
        }

        if (!admission.tokenExpiry || new Date() > admission.tokenExpiry) {
            throw new AdminTokenExpiredError();
        }

        if (params.action === "accept") {
            const registerUser = await this._admissionRepository.findRegisterUserById(admission.registerId);
            if (!registerUser) {
                throw new AdminRegisterUserNotFoundError();
            }

            const fullNameParts = admission.personal.fullName.split(" ");
            const firstName = fullNameParts[0];
            const lastName = fullNameParts.slice(1).join(" ") || "";

            const newUser = await this._userService.createUser({
                firstName,
                lastName,
                email: admission.personal.emailAddress,
                password: registerUser.password,
            });

            if (admission.choiceOfStudy && admission.choiceOfStudy.length > 0) {
                const currentYear = new Date().getFullYear();
                const yearRange = `${currentYear}-${currentYear + 4}`;

                const degree = admission.choiceOfStudy[0]?.programme || "";
                const catalogYear = admission.choiceOfStudy[0]?.catalogYear || yearRange;

                if (degree && catalogYear) {
                    await this._programService.enrollStudent({
                        studentId: newUser.id,
                        degree,
                        catalogYear,
                        credits: 20,
                    });
                }
            }

            admission.status = AdminAdmissionStatus.Approved;
            admission.confirmationToken = undefined;
            admission.tokenExpiry = undefined;

            await this._admissionRepository.saveAdmission(admission);

            return { message: "Admission accepted and user account created" };
        } else {
            admission.status = AdminAdmissionStatus.Rejected;
            admission.confirmationToken = undefined;
            admission.tokenExpiry = undefined;

            await this._admissionRepository.saveAdmission(admission);

            return { message: "Admission offer rejected" };
        }
    }
}

export class BlockAdmissionUseCase implements IBlockAdmissionUseCase {
    constructor(
        private _admissionRepository: IAdmissionRepository,
        private _userService: IUserService
    ) { }

    async execute(params: { id: string }): Promise<{ message: string }> {
        const admission = await this._admissionRepository.findAdmissionById(params.id);
        if (!admission) {
            throw new AdminAdmissionNotFoundError();
        }
        const user = await this._userService.findByEmail(admission.personal.emailAddress);
        if (!user) {
            throw new AdminRegisterUserNotFoundError();
        }

        const result = await this._userService.toggleBlock(user.id);

        return { message: result.blocked ? 'User blocked' : 'User unblocked' };
    }
}