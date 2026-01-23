import { ChargeProps, PaymentProps } from "../../../domain/financial/financialtypes";

export interface DocumentDTO {
  id: string;
  name: string;
  url: string;
  status: "Verified" | "Pending" | "Rejected";
}

export interface GetStudentFinancialInfoRequestDTO {
  studentId: string;
}

export interface GetAllPaymentsRequestDTO {
  startDate?: string;
  endDate?: string;
  status?: string;
  studentId?: string; // Added for filtering by studentId
  page: number;
  limit: number;
}

export interface GetOnePaymentRequestDTO {
  paymentId: string;
}

export type MakePaymentRequestDTO = Pick<PaymentProps, "studentId" | "amount" | "method"> & {
  term: string;
  chargeId: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
};

export interface UploadDocumentRequestDTO {
  file: Express.Multer.File;
  type: string;
}

export interface GetPaymentReceiptRequestDTO {
  studentId: string;
  paymentId: string;
}

export type CreateChargeRequestDTO = Pick<ChargeProps, "title" | "description" | "amount" | "term" | "dueDate" | "applicableFor" | "createdBy">;

export interface GetAllChargesRequestDTO {
  term?: string;
  status?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface UpdateChargeRequestDTO {
  id: string;
  data: {
    title?: string;
    description?: string;
    amount?: number;
    dueDate?: string;
    term?: string;
    applicableFor?: string;
    status?: "Active" | "Inactive";
  };
}

export interface DeleteChargeRequestDTO {
  id: string;
}