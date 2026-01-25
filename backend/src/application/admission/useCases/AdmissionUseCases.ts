import {
    CreateApplicationRequestDTO, GetApplicationRequestDTO, SaveSectionRequestDTO, ProcessPaymentRequestDTO, ConfirmPaymentRequestDTO, FinalizeAdmissionRequestDTO, UploadDocumentRequestDTO, UploadMultipleDocumentsRequestDTO,
} from "../dtos/AdmissionRequestDTOs";
import {
    CreateApplicationResponseDTO, GetApplicationResponseDTO, SaveSectionResponseDTO, ProcessPaymentResponseDTO, ConfirmPaymentResponseDTO, FinalizeAdmissionResponseDTO, UploadDocumentResponseDTO, UploadMultipleDocumentsResponseDTO,
} from "../dtos/AdmissionResponseDTOs";
import { IAdmissionsRepository } from "../repositories/IAdmissionsRepository";
import {
    InvalidUserIdException, InvalidSectionException, PaymentProcessingFailedException, PaymentNotFoundException, AdmissionFinalizationFailedException, DocumentUploadFailedException
} from "../../../domain/admission/errors/AdmissionErrors";
import { AdmissionDTOMapper } from "../mappers/AdmissionDTOMapper";
import { IValidationService } from "../../shared/services/IValidationService";
import { IStorageService } from "../../shared/services/IStorageService";
import {
    ICreateApplicationUseCase,
    IGetApplicationUseCase,
    ISaveSectionUseCase,
    IProcessPaymentUseCase,
    IConfirmPaymentUseCase,
    IFinalizeAdmissionUseCase,
    IUploadDocumentUseCase,
    IUploadMultipleDocumentsUseCase,
    IServeDocumentUseCase,
    IGetDocumentByKeyUseCase,
} from './IAdmissionUseCases';

export class CreateApplicationUseCase implements ICreateApplicationUseCase {
    constructor(
        private _admissionsRepository: IAdmissionsRepository,
        private _validationService: IValidationService
    ) { }
    async execute(params: CreateApplicationRequestDTO): Promise<CreateApplicationResponseDTO> {
        if (!params.userId || !this._validationService.isValidObjectId(params.userId)) {
            throw new InvalidUserIdException();
        }
        return this._admissionsRepository.createApplication(params);
    }
}

export class GetApplicationUseCase implements IGetApplicationUseCase {
    constructor(
        private _admissionsRepository: IAdmissionsRepository,
        private _validationService: IValidationService
    ) { }
    async execute(params: GetApplicationRequestDTO): Promise<GetApplicationResponseDTO> {
        if (!params.userId || !this._validationService.isValidObjectId(params.userId)) {
            throw new InvalidUserIdException();
        }
        const draft = await this._admissionsRepository.findDraftByRegisterId(params.userId);
        return {
            draft: draft ? AdmissionDTOMapper.toDraftDTO(draft) : null,
        };
    }
}

export class SaveSectionUseCase implements ISaveSectionUseCase {
    constructor(private _admissionsRepository: IAdmissionsRepository) { }
    async execute(params: SaveSectionRequestDTO): Promise<SaveSectionResponseDTO> {
        const validSections = [
            "personalInfo", "choiceOfStudy", "education", "achievements", "otherInformation", "documents", "declaration"
        ];
        if (!validSections.includes(params.section)) {
            throw new InvalidSectionException();
        }
        const draft = await this._admissionsRepository.findDraftByApplicationId(params.applicationId);
        if (!draft) throw new Error("Application not found");

        const sectionMap: { [key: string]: string } = {
            personalInfo: "personal",
            choiceOfStudy: "choiceOfStudy",
            education: "education",
            achievements: "achievements",
            otherInformation: "otherInformation",
            documents: "documents",
            declaration: "declaration",
        };
        const field = sectionMap[params.section];
        if (!field) throw new InvalidSectionException();

        draft.updateSection(field, params.data);
        draft.addCompletedStep(field);

        await this._admissionsRepository.saveDraft(draft);

        return {
            success: true,
            message: "Section saved successfully",
            data: AdmissionDTOMapper.toDraftDTO(draft),
        };
    }
}

export class ProcessPaymentUseCase implements IProcessPaymentUseCase {
    constructor(private _admissionsRepository: IAdmissionsRepository) { }
    async execute(params: ProcessPaymentRequestDTO): Promise<ProcessPaymentResponseDTO> {
        if (!params.applicationId || !params.paymentDetails) {
            throw new PaymentProcessingFailedException();
        }
        return this._admissionsRepository.processPayment(params);
    }
}

export class ConfirmPaymentUseCase implements IConfirmPaymentUseCase {
    constructor(private _admissionsRepository: IAdmissionsRepository) { }
    async execute(params: ConfirmPaymentRequestDTO): Promise<ConfirmPaymentResponseDTO> {
        if (!params.paymentId || !params.stripePaymentIntentId) {
            throw new PaymentProcessingFailedException();
        }
        return this._admissionsRepository.confirmPayment(params);
    }
}

export class FinalizeAdmissionUseCase implements IFinalizeAdmissionUseCase {
    constructor(private _admissionsRepository: IAdmissionsRepository) { }
    async execute(params: FinalizeAdmissionRequestDTO): Promise<FinalizeAdmissionResponseDTO> {
        if (!params.applicationId || !params.paymentId) {
            throw new AdmissionFinalizationFailedException();
        }
        const result = await this._admissionsRepository.finalizeAdmission(params);
        return {
            admission: AdmissionDTOMapper.toAdmissionDTO(result.admission),
        };
    }
}

export class UploadDocumentUseCase implements IUploadDocumentUseCase {
    constructor(private _admissionsRepository: IAdmissionsRepository) { }
    async execute(params: UploadDocumentRequestDTO): Promise<UploadDocumentResponseDTO> {
        if (!params.applicationId || !params.file) {
            throw new DocumentUploadFailedException();
        }
        return this._admissionsRepository.uploadDocument(params);
    }
}

export class UploadMultipleDocumentsUseCase implements IUploadMultipleDocumentsUseCase {
    constructor(private _admissionsRepository: IAdmissionsRepository) { }
    async execute(params: UploadMultipleDocumentsRequestDTO): Promise<UploadMultipleDocumentsResponseDTO> {
        if (!params.applicationId || !params.files) {
            throw new DocumentUploadFailedException();
        }
        return this._admissionsRepository.uploadMultipleDocuments(params);
    }
}

export class GetDocumentByKeyUseCase implements IGetDocumentByKeyUseCase {
    constructor(private _admissionsRepository: IAdmissionsRepository) { }
    async execute(params: { userId: string; documentKey: string }): Promise<{
        url?: string;
        fileName?: string;
        fileType?: string;
        [key: string]: unknown;
    } | null> {
        return this._admissionsRepository.getDocumentByKey(params);
    }
}


export class ServeDocumentUseCase implements IServeDocumentUseCase {
    constructor(
        private _admissionsRepository: IAdmissionsRepository,
        private _storageService: IStorageService
    ) { }
    async execute(params: { userId: string; documentId: string }): Promise<{
        url?: string;
        fileName?: string;
        fileType?: string;
        pdfData: string;
        [key: string]: unknown;
    } | null> {
        const document = await this._admissionsRepository.getDocumentByKey({
            userId: params.userId,
            documentKey: params.documentId
        });

        if (!document || !document.url) return null;

        try {
            const buffer = await this._storageService.fetchFileAsBuffer(document.url);
            const pdfData = buffer.toString('base64');

            return {
                ...document,
                pdfData
            };
        } catch (error) {
            return null;
        }
    }
}