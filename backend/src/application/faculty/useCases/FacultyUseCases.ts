import {
    GetFacultyRequestDTO,
    GetFacultyByIdRequestDTO,
    GetFacultyByTokenRequestDTO,
    ApproveFacultyRequestDTO,
    RejectFacultyRequestDTO,
    DeleteFacultyRequestDTO,
    ConfirmFacultyOfferRequestDTO,
    DownloadCertificateRequestDTO,
} from "../dtos/FacultyRequestDTOs";
import {
    GetFacultyResponseDTO,
    GetFacultyByIdResponseDTO,
    GetFacultyByTokenResponseDTO,
    ApproveFacultyResponseDTO,
    RejectFacultyResponseDTO,
    DeleteFacultyResponseDTO,
    ConfirmFacultyOfferResponseDTO,
    DownloadCertificateResponseDTO,
    FacultyResponseDTO,
} from "../dtos/FacultyResponseDTOs";
import { IFacultyRepository } from "../repositories/IFacultyRepository";
import { emailService } from '../../../infrastructure/services/email.service';
import { config } from '../../../config/config';
import { generatePassword } from '../../../infrastructure/services/passwordService';
import {
    FacultyNotFoundError,
    FacultyAlreadyProcessedError,
    InvalidTokenError,
    InvalidActionError,
    MissingRequiredFieldsError,
    InvalidCertificateUrlError,
    CertificateNotFoundError,
    UnauthorizedAccessError,
} from '../../../domain/faculty/errors/FacultyErrors';
import { Faculty } from "../../../domain/faculty/entities/Faculty";
import { FacultyStatus, FacultyRejectedBy } from "../../../domain/faculty/enums/FacultyEnums";
import { FacultyConstants } from "../constants/FacultyConstants";
import { IStorageService } from "../../shared/services/IStorageService";
import {
    ResponseDTO,
    IGetFacultyUseCase,
    IGetFacultyByIdUseCase,
    IApproveFacultyUseCase,
    IBlockFacultyUseCase,
    IConfirmFacultyOfferUseCase,
    IDeleteFacultyUseCase,
    IDownloadCertificateUseCase,
    IGetFacultyByTokenUseCase,
    IRejectFacultyUseCase,
    IServeDocumentUseCase,
} from "./IFacultyUseCases";

export class GetFacultyUseCase implements IGetFacultyUseCase {
    constructor(private _facultyRepository: IFacultyRepository) { }

    async execute(params: GetFacultyRequestDTO): Promise<ResponseDTO<GetFacultyResponseDTO>> {
        const { page = 1, limit = 5, status = FacultyConstants.DEFAULTS.STATUS, department = FacultyConstants.DEFAULTS.DEPARTMENT, dateRange = FacultyConstants.DEFAULTS.DATE_RANGE, search, startDate, endDate } = params;

        const filters: import("../repositories/IFacultyRepository").IFacultyFilters = {};

        if (status && status !== "all") {
            filters.status = status as FacultyStatus;
        }
        if (department && department !== "all_departments") {
            filters.department = department;
        }

        if (dateRange && dateRange !== "all") {
            const now = new Date();
            let start: Date | undefined;
            let end: Date | undefined;

            switch (dateRange) {
                case "last_week":
                    start = new Date(now.setDate(now.getDate() - 7));
                    break;
                case "last_month":
                    start = new Date(now.setDate(now.getDate() - 30));
                    break;
                case "last_3_months":
                    start = new Date(now.setDate(now.getDate() - 90));
                    break;
                case "custom":
                    if (startDate && endDate) {
                        start = new Date(startDate);
                        end = new Date(endDate);
                    }
                    break;
            }
            if (start) {
                filters.createdAt = { start, end };
            }
        }

        if (search) {
            filters.search = search.trim();
        }

        const skip = (page - 1) * limit;
        const facultyList = await this._facultyRepository.findFaculty(filters, {
            skip,
            limit,
        });
        const totalFaculty = await this._facultyRepository.countFaculty(filters);
        const totalPages = Math.ceil(totalFaculty / limit);

        return {
            data: {
                faculty: facultyList.map(mapFacultyToDTO),
                totalFaculty,
                totalPages,
                currentPage: page,
            },
            success: true,
        };
    }
}

export class GetFacultyByIdUseCase implements IGetFacultyByIdUseCase {
    constructor(private _facultyRepository: IFacultyRepository) { }

    async execute(params: GetFacultyByIdRequestDTO): Promise<ResponseDTO<GetFacultyByIdResponseDTO>> {
        const faculty = await this._facultyRepository.getFacultyById(params.id);
        if (!faculty) {
            throw new FacultyNotFoundError();
        }
        return {
            data: { faculty: mapFacultyToDTO(faculty) },
            success: true,
        };
    }
}

export class GetFacultyByTokenUseCase implements IGetFacultyByTokenUseCase {
    constructor(private _facultyRepository: IFacultyRepository) { }

    async execute(params: GetFacultyByTokenRequestDTO): Promise<ResponseDTO<GetFacultyByTokenResponseDTO>> {
        if (!params.token) {
            throw new InvalidTokenError();
        }
        const faculty = await this._facultyRepository.getFacultyByToken(params.token);
        if (!faculty) {
            throw new FacultyNotFoundError();
        }
        if (faculty.status !== FacultyStatus.OFFERED) {
            throw new FacultyAlreadyProcessedError();
        }
        return { data: { faculty: mapFacultyToDTO(faculty) }, success: true };
    }
}

export class ApproveFacultyUseCase implements IApproveFacultyUseCase {
    constructor(private _facultyRepository: IFacultyRepository) { }

    private generateConfirmationToken(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    async execute(params: ApproveFacultyRequestDTO): Promise<ResponseDTO<ApproveFacultyResponseDTO>> {
        if (!params.additionalInfo.department || !params.additionalInfo.startDate) {
            throw new MissingRequiredFieldsError();
        }

        const faculty = await this._facultyRepository.getFacultyById(params.id);
        if (!faculty) {
            throw new FacultyNotFoundError();
        }
        if (faculty.status !== FacultyStatus.PENDING) {
            throw new FacultyAlreadyProcessedError();
        }

        const confirmationToken = this.generateConfirmationToken();
        const tokenExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

        const updatedFaculty = new Faculty({
            ...faculty,
            department: params.additionalInfo.department,
            status: FacultyStatus.OFFERED,
            confirmationToken,
            tokenExpiry,
        });

        await this._facultyRepository.updateFaculty(updatedFaculty);

        const baseUrl = config.frontendUrl;
        const acceptUrl = `${baseUrl}/confirm-faculty/${params.id}/accept?token=${confirmationToken}`;
        const rejectUrl = `${baseUrl}/confirm-faculty/${params.id}/reject?token=${confirmationToken}`;

        await emailService.sendFacultyOfferEmail({
            to: faculty.email,
            name: faculty.fullName,
            department: params.additionalInfo.department,
            position: params.additionalInfo.position,
            startDate: params.additionalInfo.startDate,
            salary: params.additionalInfo.salary,
            benefits: params.additionalInfo.benefits,
            additionalNotes: params.additionalInfo.additionalNotes,
            acceptUrl,
            rejectUrl,
            expiryDays: 14,
        });

        return { data: { message: "Faculty approval email sent" }, success: true };
    }
}

export class RejectFacultyUseCase implements IRejectFacultyUseCase {
    constructor(private _facultyRepository: IFacultyRepository) { }

    async execute(params: RejectFacultyRequestDTO): Promise<ResponseDTO<RejectFacultyResponseDTO>> {
        const faculty = await this._facultyRepository.getFacultyById(params.id);
        if (!faculty) {
            throw new FacultyNotFoundError();
        }
        if (faculty.status !== FacultyStatus.PENDING) {
            throw new FacultyAlreadyProcessedError();
        }

        const updatedFaculty = new Faculty({
            ...faculty,
            status: FacultyStatus.REJECTED,
            rejectedBy: FacultyRejectedBy.ADMIN
        });

        await this._facultyRepository.updateFaculty(updatedFaculty);
        return { data: { message: "Faculty registration rejected" }, success: true };
    }
}

export class DeleteFacultyUseCase implements IDeleteFacultyUseCase {
    constructor(
        private _facultyRepository: IFacultyRepository,
        private _storageService: IStorageService
    ) { }

    async execute(params: DeleteFacultyRequestDTO): Promise<ResponseDTO<DeleteFacultyResponseDTO>> {
        const faculty = await this._facultyRepository.getFacultyById(params.id);
        if (!faculty) {
            throw new FacultyNotFoundError();
        }
        if (faculty.status !== FacultyStatus.PENDING) {
            throw new FacultyAlreadyProcessedError();
        }
        await this._facultyRepository.deleteFaculty(params.id);

        // Cleanup Files
        if (faculty.cvUrl) {
            await this._storageService.deleteFile(faculty.cvUrl);
        }
        if (faculty.certificatesUrl && faculty.certificatesUrl.length > 0) {
            for (const certUrl of faculty.certificatesUrl) {
                await this._storageService.deleteFile(certUrl);
            }
        }

        return { data: { message: "Faculty registration deleted" }, success: true };
    }
}

export class ConfirmFacultyOfferUseCase implements IConfirmFacultyOfferUseCase {
    constructor(private _facultyRepository: IFacultyRepository) { }

    async execute(params: ConfirmFacultyOfferRequestDTO): Promise<ResponseDTO<ConfirmFacultyOfferResponseDTO>> {
        if (!params.token) {
            throw new InvalidTokenError();
        }
        if (params.action !== FacultyConstants.ACTIONS.ACCEPT && params.action !== FacultyConstants.ACTIONS.REJECT) {
            throw new InvalidActionError();
        }
        const faculty = await this._facultyRepository.getFacultyById(params.facultyId);
        if (!faculty) {
            throw new FacultyNotFoundError();
        }
        if (faculty.status !== FacultyStatus.OFFERED) {
            throw new FacultyAlreadyProcessedError();
        }

        let newStatus: FacultyStatus = FacultyStatus.OFFERED;
        let rejectedBy: FacultyRejectedBy | undefined = undefined;

        if (params.action === FacultyConstants.ACTIONS.ACCEPT) {
            newStatus = FacultyStatus.APPROVED;

            const temporaryPassword = generatePassword();
            const fullNameParts = faculty.fullName.split(" ");
            const firstName = fullNameParts[0];
            const lastName = fullNameParts.slice(1).join(" ") || "";

            await this._facultyRepository.createFacultyAccount({
                firstName,
                lastName,
                email: faculty.email,
                password: temporaryPassword,
            });

            const loginUrl = `${config.frontendUrl}/faculty/login`;
            await emailService.sendFacultyCredentialsEmail({
                to: faculty.email,
                name: faculty.fullName,
                email: faculty.email,
                password: temporaryPassword,
                loginUrl,
                department: faculty.department || "",
                additionalInstructions: "Please log in and change your temporary password as soon as possible for security purposes.",
            });
        } else {
            newStatus = FacultyStatus.REJECTED;
            rejectedBy = FacultyRejectedBy.USER;
        }

        const updatedFaculty = new Faculty({
            ...faculty,
            status: newStatus,
            rejectedBy,
            confirmationToken: null,
            tokenExpiry: null
        });

        await this._facultyRepository.updateFaculty(updatedFaculty);

        return {
            data: {
                message: params.action === FacultyConstants.ACTIONS.ACCEPT
                    ? "Faculty offer accepted and faculty account created"
                    : "Faculty offer rejected",
            },
            success: true,
        };
    }
}

export class DownloadCertificateUseCase implements IDownloadCertificateUseCase {
    constructor(
        private _facultyRepository: IFacultyRepository,
        private _storageService: IStorageService
    ) { }

    async execute(params: DownloadCertificateRequestDTO): Promise<ResponseDTO<DownloadCertificateResponseDTO>> {
        if (!params.certificateUrl || typeof params.certificateUrl !== "string") {
            throw new InvalidCertificateUrlError();
        }
        if (!params.type || ![FacultyConstants.DOCUMENT_TYPES.CV, FacultyConstants.DOCUMENT_TYPES.CERTIFICATE].includes(params.type.toLowerCase())) {
            throw new InvalidCertificateUrlError();
        }
        const faculty = await this._facultyRepository.getFacultyById(params.facultyId);
        if (!faculty) {
            throw new FacultyNotFoundError();
        }
        const isAuthorized = params.requestingUserId === faculty.id;
        if (!isAuthorized) {
            throw new UnauthorizedAccessError();
        }

        const publicId = this._storageService.getPublicIdFromUrl(params.certificateUrl);
        const downloadUrl = this._storageService.generateSignedUrl(publicId, {
            resource_type: "image",
            type: "upload",
        });

        const fileStream = await this._storageService.fetchFileAsStream(downloadUrl);
        const fileName = params.certificateUrl.split("/").pop() || `${params.type}_${params.facultyId}.pdf`;

        // fileSize is harder without direct axios response, but we can pass 0 or fix IStorageService
        return { data: { fileStream, fileSize: 0, fileName }, success: true };
    }
}

export class BlockFacultyUseCase implements IBlockFacultyUseCase {
    constructor(private _facultyRepository: IFacultyRepository) { }

    async execute(params: { id: string }): Promise<ResponseDTO<{ message: string }>> {
        const faculty = await this._facultyRepository.getFacultyById(params.id);
        if (!faculty) {
            throw new FacultyNotFoundError();
        }
        const updatedFaculty = new Faculty({
            ...faculty,
            blocked: !faculty.blocked
        });
        await this._facultyRepository.updateFaculty(updatedFaculty);
        return { data: { message: updatedFaculty.blocked ? 'Faculty blocked' : 'Faculty unblocked' }, success: true };
    }
}

export class ServeDocumentUseCase implements IServeDocumentUseCase {
    constructor(
        private _facultyRepository: IFacultyRepository,
        private _storageService: IStorageService
    ) { }

    async execute(params: { facultyId: string, documentUrl: string, type: string, requestingUserId: string }): Promise<ResponseDTO<{ pdfData: string, fileName: string, contentType: string }>> {
        const { facultyId, documentUrl, type } = params;

        if (!facultyId || !type || !documentUrl) {
            throw new MissingRequiredFieldsError();
        }

        const faculty = await this._facultyRepository.getFacultyById(facultyId);
        if (!faculty) {
            throw new FacultyNotFoundError();
        }

        const publicId = this._storageService.getPublicIdFromUrl(documentUrl as string);
        const signedUrl = this._storageService.generateSignedUrl(publicId, {
            resource_type: 'raw',
            type: 'upload',
        });

        try {
            const buffer = await this._storageService.fetchFileAsBuffer(signedUrl);
            const pdfData = buffer.toString('base64');
            const fileName = `${type}_${facultyId}.pdf`;
            const contentType = 'application/pdf';
            return { data: { pdfData, fileName, contentType }, success: true };
        } catch (error) {
            throw new CertificateNotFoundError();
        }
    }
}

function mapFacultyToDTO(f: Faculty): FacultyResponseDTO {
    return {
        id: f.id!,
        fullName: f.fullName,
        email: f.email,
        phone: f.phone,
        department: f.department,
        qualification: f.qualification,
        experience: f.experience,
        aboutMe: f.aboutMe,
        cvUrl: f.cvUrl,
        certificatesUrl: f.certificatesUrl,
        createdAt: f.createdAt ? f.createdAt.toISOString() : new Date().toISOString(),
        status: f.status,
        blocked: f.blocked,
    };
}
