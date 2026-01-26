export interface StudentFinancialInfo {
  id: string;
  name: string;
  accountBalance: number;
  paymentDueDate: string;
  financialAidStatus: 'Approved' | 'Pending' | 'Rejected';
  term: string;
}

export interface Charge {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  term: string;
  applicableFor: string;
  createdBy?: string;
  creatorName?: string;
  createdAt: string;
  updatedAt: string;
  status?: 'Active' | 'Inactive';
}

export interface Payment {
  id: string;
  _id?: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  date: string;
  description: string;
  method: 'Credit Card' | 'Bank Transfer' | 'Financial Aid' | 'Razorpay';
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  receiptUrl?: string;
  paidAt?: string;
  chargeTitle?: string;
  metadata?: Record<string, unknown>;
}

export interface FinancialAidApplication {
  id: string;
  studentId: string;
  term: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  amount: number;
  type: 'Grant' | 'Loan' | 'Scholarship';
  documents: { id: string; name: string; url: string; status: DocumentStatus }[];
  applicationDate: Date | string
}

export interface Scholarship {
  id: string;
  name: string;
  description: string;
  amount: number;
  deadline: string;
  requirements: string[];
  status: 'Open' | 'Closed';
  term: string;
}

export interface ScholarshipApplication {
  id: string;
  scholarshipId: string;
  studentId: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  documents: { id: string; name: string; url: string; status: DocumentStatus }[];
  applicationDate: Date | string
}

export interface PaymentForm {
  amount: number;
  method: 'Credit Card' | 'Bank Transfer' | 'Financial Aid' | 'Razorpay';
  term: string;
  chargeId: string; // Required chargeId to track which specific charge is being paid
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

export interface Filters {
  status: string;
  term: string;
  startDate: string;
  [key: string]: string;
}

export type DocumentStatus = 'Verified' | 'Pending' | 'Rejected' | string;

export interface ViewChargesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AddChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (charge: {
    title: string;
    description: string;
    amount: number;
    term: string;
    dueDate: string;
    applicableFor: string;
  }) => void;
}

// ChargeFormData is a type inferred from the zod schema, but for type sharing, define it explicitly:
export interface ChargeFormDataRaw {
  title: string;
  description: string;
  amount: string;
  term: string;
  dueDate: string;
  applicableFor: string;
}

export interface ChargeFormData {
  title: string;
  description: string;
  amount: number;
  term: string;
  dueDate: string;
  applicableFor: string;
}

export interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string;
}


export interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type: 'success' | 'danger';
}

export interface AddChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (charge: ChargeFormData) => void;
  initialValues?: Partial<ChargeFormData>;
}

export interface ChargeDetailsModalProps {
  charge: Charge;
  isOpen: boolean;
  onClose: () => void;
}