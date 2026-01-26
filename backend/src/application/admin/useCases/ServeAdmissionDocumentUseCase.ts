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

import axios from "axios";

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

        try {
            const response = await axios.get(documentUrl, { responseType: 'arraybuffer' });

            return {
                pdfData: Buffer.from(response.data).toString('base64'),
                fileName: document.fileName,
                contentType: response.headers['content-type'] || 'application/pdf'
            };
        } catch (error) {
            throw new AdminAdmissionNotFoundError();
        }
    }
}
