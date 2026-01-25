import { IFile } from "../../shared/types/FileTypes";

// Financial domain types and interfaces

export interface ChargeProps {
    id?: string;
    title: string;
    description: string;
    amount: number;
    term: string;
    dueDate: string;
    applicableFor: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: "Active" | "Inactive";
}

export interface PaymentProps {
    id?: string;
    studentId: string;
    date: string;
    description: string;
    method: "Credit Card" | "Bank Transfer" | "Financial Aid" | "Razorpay" | "stripe";
    amount: number;
    status: "Completed" | "Pending" | "Failed";
    receiptUrl?: string;
    metadata?: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaymentFilter {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    studentId?: string;
    method?: string;
}

export interface ChargeFilter {
    title?: string;
    description?: string;
    term?: string;
    applicableFor?: string;
    status?: string;
    ids?: string[];
    startDate?: Date;
    endDate?: Date;
    studentId?: string;
    searchQuery?: string;
}

export type CreateChargeParams = {
    title: string;
    description: string;
    amount: number;
    term: string;
    dueDate: Date;
    applicableFor: string;
    createdBy: string;
};

export type UploadDocumentParams = {
    file: IFile;
    type: string;
};
