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
import { isValidObjectId } from "mongoose";
import { AdmissionDTOMapper } from "../mappers/AdmissionDTOMapper";
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
    constructor(private _admissionsRepository: IAdmissionsRepository) { }
    async execute(params: CreateApplicationRequestDTO): Promise<CreateApplicationResponseDTO> {
        if (!params.userId || !isValidObjectId(params.userId)) {
            throw new InvalidUserIdException();
        }
        return this._admissionsRepository.createApplication(params);
    }
}

export class GetApplicationUseCase implements IGetApplicationUseCase {
    constructor(private _admissionsRepository: IAdmissionsRepository) { }
    async execute(params: GetApplicationRequestDTO): Promise<GetApplicationResponseDTO> {
        if (!params.userId || !isValidObjectId(params.userId)) {
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
        cloudinaryUrl?: string;
        fileName?: string;
        fileType?: string;
        [key: string]: unknown;
    } | null> {
        return this._admissionsRepository.getDocumentByKey(params);
    }
}

import axios from 'axios';

export class ServeDocumentUseCase implements IServeDocumentUseCase {
    constructor(private _admissionsRepository: IAdmissionsRepository) { }
    async execute(params: { userId: string; documentId: string }): Promise<{
        cloudinaryUrl?: string;
        fileName?: string;
        fileType?: string;
        pdfData: string;
        [key: string]: unknown;
    } | null> {
        const document = await this._admissionsRepository.getDocumentByKey({
            userId: params.userId,
            documentKey: params.documentId
        });

        if (!document || !document.cloudinaryUrl) return null;

        try {
            const response = await axios.get(document.cloudinaryUrl, { responseType: 'arraybuffer' });
            const pdfData = Buffer.from(response.data, 'binary').toString('base64');

            return {
                ...document,
                pdfData
            };
        } catch (error) {
            return null;
        }
    }
}