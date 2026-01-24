import { PaymentMethod, IAdmission } from "../../../domain/admission/entities/AdmissionTypes";

export interface CreateApplicationRequestDTO {
  userId: string;
}

export interface GetApplicationRequestDTO {
  userId: string;
}

export interface SaveSectionRequestDTO {
  applicationId: string;
  section: string;
  data: Record<string, unknown>;
}

export interface UploadDocumentRequestDTO {
  applicationId: string;
  documentType: string;
  file: Express.Multer.File;
}

export interface UploadMultipleDocumentsRequestDTO {
  applicationId: string;
  files: Express.Multer.File[];
  documentTypes: string[];
}

export interface ProcessPaymentRequestDTO {
  applicationId: string;
  paymentDetails: {
    method: PaymentMethod | string;
    amount: number;
    currency: string;
    paymentMethodId?: string;
    returnUrl?: string;
  };
}

export interface ConfirmPaymentRequestDTO {
  paymentId: string;
  stripePaymentIntentId: string;
}

export type FinalizeAdmissionRequestDTO = Pick<IAdmission, "applicationId" | "paymentId">;