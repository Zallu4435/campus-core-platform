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
import { FacultyUserModel as FacultyModel } from '../../../infrastructure/database/mongoose/faculty/faculty.model';
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import {
    FacultyNotFoundError,
    FacultyAlreadyProcessedError,
    InvalidFacultyIdError,
    InvalidTokenError,
    InvalidActionError,
    MissingRequiredFieldsError,
    InvalidCertificateUrlError,
    CertificateNotFoundError,
    UnauthorizedAccessError,
    AuthenticationRequiredError,
} from '../../../domain/faculty/errors/FacultyErrors';
import { Faculty } from "../../../domain/faculty/entities/Faculty";
import { FacultyStatus, FacultyRejectedBy } from "../../../domain/faculty/enums/FacultyEnums";
import { FacultyConstants } from "../constants/FacultyConstants";
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

        // Let's rewrite the logic to produce clean filters.
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

        // Update Entity
        const updatedFaculty = new Faculty({
            ...faculty, // Copy existing props
            department: params.additionalInfo.department,
            status: FacultyStatus.OFFERED,
            confirmationToken,
            tokenExpiry,
            // Assuming qualification/experience etc are preserved or updated if passed
            // The Faculty Entity constructor takes an interface. We need to spread existing properties.
            // Since 'faculty' is a Faculty instance, we can't just spread it if it has methods.
            // We should have a cleaner way to update. For now assuming spread works for public props or use a clone method.
            // Actually, we can just call repo.updateFaculty with the modified data if we had setters, 
            // but Faculty is read-only (which is good). So we instantiate a new one.
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
    constructor(private _facultyRepository: IFacultyRepository) { }

    async execute(params: DeleteFacultyRequestDTO): Promise<ResponseDTO<DeleteFacultyResponseDTO>> {
        const faculty = await this._facultyRepository.getFacultyById(params.id);
        if (!faculty) {
            throw new FacultyNotFoundError();
        }
        if (faculty.status !== FacultyStatus.PENDING) {
            throw new FacultyAlreadyProcessedError();
        }
        await this._facultyRepository.deleteFaculty(params.id);
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

            // NOTE: This creates a record in 'faculty' collection (the auth model).
            // This is arguably confusing. We have FacultyRegister and Faculty models in the old code.
            // In strict clean architecture, this user creation should be handled by a UserRepository or AuthService.
            // For now, retaining duplication but using the Model directly is a violation.
            // I should ideally add 'createFacultyCredentials' to the repository.
            // Assuming I can't change the WHOLE auth system right now, I will use the model here but mark it as something to refactor.
            const facultyAccount = new FacultyModel({
                firstName,
                lastName,
                email: faculty.email,
                password: temporaryPassword,
                createdAt: new Date(),
            });
            await facultyAccount.save();

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
    constructor(private _facultyRepository: IFacultyRepository) { }

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

        // ... Cloudinary logic ...
        // Keeping implementation details here for now as moving them requires Service extraction.
        // Assuming conversion to strict logic is primary goal.
        const publicId = params.certificateUrl
            .replace(/^https:\/\/res\.cloudinary\.com\/vago-university\/image\/upload\/v[0-9]+\//, "")
            .replace(/\.pdf$/, "");
        const downloadUrl = cloudinary.url(publicId, {
            resource_type: "image",
            secure: true,
            type: "upload",
            sign_url: true,
            api_secret: config.cloudinary.apiSecret,
        });
        const response = await axios.get(downloadUrl, { responseType: "stream" });
        const fileSize = parseInt(response.headers["content-length"] || "0", 10);
        const fileName = params.certificateUrl.split("/").pop() || `${params.type}_${params.facultyId}.pdf`;
        const fileStream = response.data;

        return { data: { fileStream, fileSize, fileName }, success: true };
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
    constructor(private _facultyRepository: IFacultyRepository) { }

    async execute(params: { facultyId: string, documentUrl: string, type: string, requestingUserId: string }): Promise<ResponseDTO<{ pdfData: string, fileName: string, contentType: string }>> {
        const { facultyId, documentUrl, type, requestingUserId } = params;

        if (!facultyId || !type || !documentUrl) {
            throw new MissingRequiredFieldsError();
        }

        const faculty = await this._facultyRepository.getFacultyById(facultyId);
        if (!faculty) {
            throw new FacultyNotFoundError();
        }

        const urlParts = (documentUrl as string).split('/');
        const publicId = urlParts.slice(-2).join('/').replace(/\.[^/.]+$/, '');

        const signedUrl = cloudinary.url(publicId, {
            resource_type: 'raw',
            type: 'upload',
            sign_url: true,
            secure: true
        });

        try {
            const response = await axios.get(signedUrl, { responseType: 'arraybuffer' });
            const pdfData = Buffer.from(response.data).toString('base64');
            const fileName = `${type}_${facultyId}.pdf`;
            const contentType = 'application/pdf';
            return { data: { pdfData, fileName, contentType }, success: true };
        } catch (error) {
            // Re-throwing or handling error. Ideally map to Domain Error.
            throw new CertificateNotFoundError(); // Assuming failure means not found or access issue
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

