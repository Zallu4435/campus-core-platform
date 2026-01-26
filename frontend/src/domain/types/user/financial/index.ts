export interface Charge {
  id: string;
  amount?: number;
  chargeTitle?: string;
  chargeDescription?: string;
  term?: string;
  paymentDueDate?: string;
  status?: 'Pending' | 'Paid';
  name?: string;
  email?: string;
  contact?: string;
}

export interface Payment {
  id?: string;
  paidAt?: string;
  date?: string;
  chargeTitle?: string;
  description?: string;
  method?: 'Financial Aid' | 'Credit Card' | 'Bank Transfer' | 'Razorpay' | 'stripe';
  amount?: number;
}

export interface FeesPaymentsSectionProps {
  studentInfo: Charge[];
  paymentHistory: Payment[];
  onPaymentSuccess?: () => void;
}

export interface StudentFinancialInfo {
  info: Array<{
    id: string;
    amount?: number;
    paymentDueDate?: string;
    chargeTitle?: string;
    chargeDescription?: string;
    term?: string;
    status?: 'Pending' | 'Paid';
  }>;
  history: unknown[];
  financialAidStatus?: string;
}

export interface FinancialTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export interface PaymentReceiptModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export type ApplicationType = 'Grant' | 'Loan' | 'Scholarship';

export interface Document {
  name: string;
  url: string;
}

export interface ApplicationForm {
  studentId: string;
  term: string;
  amount: number;
  type: ApplicationType;
  documents: Document[];
}

export interface ExtendedCharge extends Charge {
  paidAt?: string;
  method?: string;
}

export interface FinancialState {
  info: Charge[];
  history: Payment[];
  financialAidStatus: string;
}

export interface FinancialTabsWithDisabledProps extends FinancialTabsProps {
  disabledTabs?: string[];
}
