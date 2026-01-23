
export interface DocumentDTO {
  id: string;
  name: string;
  url: string;
  status: "Verified" | "Pending" | "Rejected";
}

export interface StudentFinancialInfoResponseDTO {
  id: string;
  studentId: string;
  chargeId: string;
  amount: number;
  paymentDueDate: string;
  status: "Paid" | "Pending";
  term: string;
  issuedAt: string;
  paidAt?: string;
  method?: string;
  createdAt: string;
  updatedAt: string;
  chargeTitle?: string;
  chargeDescription?: string;
}

export type PaymentResponseDTO = {
  id: string;
  studentId: string;
  chargeId: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  method: 'Credit Card' | 'Bank Transfer' | 'Financial Aid' | 'Razorpay' | 'stripe';
  date: string;
  orderId?: string;
  currency?: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

export type ChargeResponseDTO = {
  id: string;
  title: string;
  description: string;
  amount: number;
  term: string;
  dueDate: string;
  applicableFor: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export interface GetStudentFinancialInfoResponseDTO {
  info: StudentFinancialInfoResponseDTO[];
  history: Array<{
    id?: string;
    paidAt?: string;
    chargeTitle?: string;
    method?: string;
    amount: number;
  }>;
}

export interface GetAllPaymentsResponseDTO {
  data: PaymentResponseDTO[];
  totalPayments: number;
  totalPages: number;
  currentPage: number;
}

export interface GetOnePaymentResponseDTO {
  payment: PaymentResponseDTO;
}

export interface MakePaymentResponseDTO {
  id: string;
  orderId?: string;
  amount: number;
  currency?: string;
  status: "Completed" | "Pending" | "Failed";
  date?: string;
  description?: string;
  method?: "Credit Card" | "Bank Transfer" | "Financial Aid" | "Razorpay" | "stripe";
  metadata?: Record<string, unknown>;
}

export interface UploadDocumentResponseDTO {
  url: string;
}

export interface GetPaymentReceiptResponseDTO {
  url: string;
}

export interface CreateChargeResponseDTO {
  charge: ChargeResponseDTO;
  studentFinancialInfos: StudentFinancialInfoResponseDTO[];
}

export interface GetAllChargesResponseDTO {
  data: ChargeResponseDTO[];
  total: number;
}

export interface UpdateChargeResponseDTO {
  charge: ChargeResponseDTO;
}

export interface DeleteChargeResponseDTO {
  success: boolean;
}