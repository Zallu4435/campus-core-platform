import { IAdmissionDraft, IAdmission, IDocument } from "../../../domain/admission/entities/AdmissionTypes";

export type CreateApplicationResponseDTO = Pick<IAdmission, "applicationId">;

export interface GetApplicationResponseDTO {
  draft: IAdmissionDraft | null;
}

export interface SaveSectionResponseDTO {
  success: boolean;
  message: string;
  data?: IAdmissionDraft;
}

export interface ProcessPaymentResponseDTO {
  paymentId: string;
  status: string;
  message: string;
  clientSecret: string | null;
  stripePaymentIntentId?: string;
}

export interface ConfirmPaymentResponseDTO {
  paymentId: string;
  status: string;
  message: string;
  stripePaymentIntentId: string;
}

export interface FinalizeAdmissionResponseDTO {
  admission: IAdmission;
}

export interface UploadDocumentResponseDTO {
  success: boolean;
  message: string;
  document: Pick<IDocument, "url" | "publicId" | "fileName" | "fileType">;
}

export interface UploadMultipleDocumentsResponseDTO {
  success: boolean;
  message: string;
  documents: Array<Pick<IDocument, "url" | "publicId" | "fileName" | "fileType">>;
}