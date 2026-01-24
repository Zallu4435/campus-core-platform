import {
  CreateApplicationRequestDTO,
  GetApplicationRequestDTO,
  SaveSectionRequestDTO,
  ProcessPaymentRequestDTO,
  ConfirmPaymentRequestDTO,
  FinalizeAdmissionRequestDTO,
  UploadDocumentRequestDTO,
  UploadMultipleDocumentsRequestDTO,
} from "../dtos/AdmissionRequestDTOs";
import {
  CreateApplicationResponseDTO,
  GetApplicationResponseDTO,
  SaveSectionResponseDTO,
  ProcessPaymentResponseDTO,
  ConfirmPaymentResponseDTO,
  FinalizeAdmissionResponseDTO,
  UploadDocumentResponseDTO,
  UploadMultipleDocumentsResponseDTO,
} from "../dtos/AdmissionResponseDTOs";

export interface ICreateApplicationUseCase {
  execute(params: CreateApplicationRequestDTO): Promise<CreateApplicationResponseDTO>;
}

export interface IGetApplicationUseCase {
  execute(params: GetApplicationRequestDTO): Promise<GetApplicationResponseDTO>;
}

export interface ISaveSectionUseCase {
  execute(params: SaveSectionRequestDTO): Promise<SaveSectionResponseDTO>;
}

export interface IProcessPaymentUseCase {
  execute(params: ProcessPaymentRequestDTO): Promise<ProcessPaymentResponseDTO>;
}

export interface IConfirmPaymentUseCase {
  execute(params: ConfirmPaymentRequestDTO): Promise<ConfirmPaymentResponseDTO>;
}

export interface IFinalizeAdmissionUseCase {
  execute(params: FinalizeAdmissionRequestDTO): Promise<FinalizeAdmissionResponseDTO>;
}

export interface IUploadDocumentUseCase {
  execute(params: UploadDocumentRequestDTO): Promise<UploadDocumentResponseDTO>;
}

export interface IUploadMultipleDocumentsUseCase {
  execute(params: UploadMultipleDocumentsRequestDTO): Promise<UploadMultipleDocumentsResponseDTO>;
}

export interface IGetDocumentByKeyUseCase {
  execute(params: { userId: string; documentKey: string }): Promise<{
    cloudinaryUrl?: string;
    fileName?: string;
    fileType?: string;
    [key: string]: unknown;
  } | null>;
}

export interface IServeDocumentUseCase {
  execute(params: { userId: string; documentId: string }): Promise<{
    cloudinaryUrl?: string;
    fileName?: string;
    fileType?: string;
    pdfData: string;
    [key: string]: unknown;
  } | null>;
}


