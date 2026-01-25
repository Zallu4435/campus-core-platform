// ServeAdmissionDocumentUseCase.ts
import { IAdmissionRepository } from "../repositories/IAdmissionRepository";
import { AdminAdmissionNotFoundError } from "../../../domain/admin/errors/AdminAdmissionErrors";

export interface ServeAdmissionDocumentRequestDTO {
    documentId: string;
    admissionId: string;
}

export interface ServeAdmissionDocumentResponseDTO {
    pdfData: string;
    fileName: string;
    contentType: string;
}

export interface IServeAdmissionDocumentUseCase {
    execute(params: ServeAdmissionDocumentRequestDTO): Promise<ServeAdmissionDocumentResponseDTO>;
}

export class ServeAdmissionDocumentUseCase implements IServeAdmissionDocumentUseCase {
    constructor(private _admissionRepository: IAdmissionRepository) { }

    async execute(params: ServeAdmissionDocumentRequestDTO): Promise<ServeAdmissionDocumentResponseDTO> {
        const { admissionId, documentId } = params;

        const admission = await this._admissionRepository.findAdmissionById(admissionId);
        if (!admission) {
            throw new AdminAdmissionNotFoundError();
        }

        const docsArray = admission.documents?.documents || [];
        const document = docsArray.find((doc) => doc.id === documentId);

        if (!document) {
            throw new AdminAdmissionNotFoundError();
        }

        const documentUrl = document.url || document.path;

        if (!documentUrl) {
            throw new AdminAdmissionNotFoundError();
        }

        const response = await fetch(documentUrl);

        if (!response.ok) {
            throw new AdminAdmissionNotFoundError();
        }

        const pdfBuffer = await response.arrayBuffer();

        return {
            pdfData: Buffer.from(pdfBuffer).toString('base64'),
            fileName: document.fileName,
            contentType: 'application/pdf'
        };
    }
}
