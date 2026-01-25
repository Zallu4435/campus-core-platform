import {
    Payment,
    Charge,
    StudentFinancialInfo,
} from '../../../domain/financial/entities/FinancialEntities';

import { IPaymentSource, IChargeSource, IFinancialInfoAggregated } from "./infraTypes";

export class FinancialMapper {
    static toPayment(raw: IPaymentSource): Payment {
        return Payment.create({
            id: raw._id.toString(),
            studentId: raw.studentId.toString(),
            chargeId: raw.chargeId?.toString() || '',
            amount: raw.amount,
            status: raw.status as 'Completed' | 'Pending' | 'Failed',
            method: raw.method as 'Credit Card' | 'Bank Transfer' | 'Financial Aid' | 'Razorpay' | 'stripe',
            date: new Date(raw.date || raw.createdAt || Date.now()),
            orderId: (raw.metadata?.razorpayOrderId as string) || '',
            currency: 'INR', // Default or from raw
            description: raw.description,
            metadata: raw.metadata,
        });
    }

    static toCharge(raw: IChargeSource): Charge {
        // Handle applicableFor - can be string or object
        let applicableFor: Record<string, unknown>;
        if (typeof raw.applicableFor === 'string') {
            try {
                applicableFor = JSON.parse(raw.applicableFor);
            } catch {
                // If it's not JSON, treat it as a simple object
                applicableFor = { type: raw.applicableFor };
            }
        } else {
            applicableFor = raw.applicableFor || {};
        }

        return Charge.create({
            id: raw._id.toString(),
            title: raw.title,
            description: raw.description,
            amount: raw.amount,
            term: raw.term,
            dueDate: new Date(raw.dueDate),
            applicableFor,
            createdBy: raw.createdBy?.toString() || '',
            status: raw.status,
            createdAt: new Date(raw.createdAt || Date.now()),
            updatedAt: new Date(raw.updatedAt || Date.now()),
        });
    }

    static toStudentFinancialInfo(raw: IFinancialInfoAggregated): StudentFinancialInfo {
        return StudentFinancialInfo.create({
            id: raw.id || raw._id?.toString() || '',
            studentId: raw.studentId?.toString() || '',
            chargeId: raw.chargeId?.toString() || '',
            amount: raw.amount || 0,
            paymentDueDate: new Date(raw.paymentDueDate || Date.now()),
            status: (raw.status as 'Paid' | 'Pending') || 'Pending',
            term: raw.term || '',
            issuedAt: new Date(raw.issuedAt || Date.now()),
            createdAt: new Date(raw.createdAt || Date.now()),
            updatedAt: new Date(raw.updatedAt || Date.now()),
            paidAt: raw.paidAt ? new Date(raw.paidAt) : undefined,
            method: raw.method,
            chargeTitle: raw.chargeTitle,
            chargeDescription: raw.chargeDescription,
        });
    }

    // Helper to convert charge entity back to database format
    static chargeToDatabase(charge: Charge) {
        return {
            title: charge.title,
            description: charge.description,
            amount: charge.amount,
            term: charge.term,
            dueDate: charge.dueDate,
            applicableFor: JSON.stringify(charge.applicableFor),
            createdBy: charge.createdBy,
            status: charge.status,
            createdAt: charge.createdAt,
            updatedAt: charge.updatedAt,
        };
    }
}
