import {
  CreateApplicationResponseDTO,
  ProcessPaymentResponseDTO,
  ConfirmPaymentResponseDTO,
  UploadDocumentResponseDTO,
  UploadMultipleDocumentsResponseDTO,
} from "../dtos/AdmissionResponseDTOs";
import { Admission, AdmissionDraft } from "../../../domain/admission/entities/Admission";
import { IFile } from "../../../domain/shared/types/FileTypes";

export interface IAdmissionsRepository {
  createApplication(params: { userId: string }): Promise<CreateApplicationResponseDTO>;
  findDraftByRegisterId(userId: string): Promise<AdmissionDraft | null>;
  findDraftByApplicationId(applicationId: string): Promise<AdmissionDraft | null>;
  saveDraft(draft: AdmissionDraft): Promise<void>;
  processPayment(params: { applicationId: string, paymentDetails: { method: string, amount: number, currency: string, paymentMethodId?: string, returnUrl?: string } }): Promise<ProcessPaymentResponseDTO>;
  confirmPayment(params: { paymentId: string, stripePaymentIntentId: string }): Promise<ConfirmPaymentResponseDTO>;
  finalizeAdmission(params: { applicationId: string, paymentId: string }): Promise<{ admission: Admission }>;
  uploadDocument(params: { file: IFile, applicationId: string, documentType: string }): Promise<UploadDocumentResponseDTO>;
  uploadMultipleDocuments(params: { files: IFile[], applicationId: string, documentTypes: string[] }): Promise<UploadMultipleDocumentsResponseDTO>;
  getDocumentByKey(params: { userId: string; documentKey: string }): Promise<{ url?: string; fileName?: string; fileType?: string;[key: string]: unknown } | null>;
}