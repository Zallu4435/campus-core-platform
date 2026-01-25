import { Types } from "mongoose";

export interface IPaymentSource {
    _id: Types.ObjectId | string;
    studentId: Types.ObjectId | string;
    description: string;
    amount: number;
    method: string;
    status: string;
    date: Date | string;
    metadata?: Record<string, unknown>;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    chargeId?: Types.ObjectId | string;
    receiptUrl?: string;
}

export interface IChargeSource {
    _id: Types.ObjectId | string;
    description: string;
    title: string;
    amount: number;
    dueDate: Date | string;
    status: string;
    term: string;
    applicableFor: string | Record<string, unknown>;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    createdBy?: Types.ObjectId | string;
    [key: string]: unknown;
}

export interface IStudentFinancialInfoSource {
    _id: Types.ObjectId | string;
    studentId: Types.ObjectId | string;
    chargeId: Types.ObjectId | string;
    amount: number;
    paymentDueDate: Date | string;
    status: string;
    term: string;
    issuedAt: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    paidAt?: Date | string;
    method?: string;
    paymentId?: Types.ObjectId | string;
}

export interface IFinancialInfoAggregated extends Partial<IStudentFinancialInfoSource> {
    // Fields from Charge
    chargeTitle?: string;
    chargeDescription?: string;
    // Fields that might come from either
    id?: string;
    description?: string;
    // Ensure compatibility
    [key: string]: unknown;
}
