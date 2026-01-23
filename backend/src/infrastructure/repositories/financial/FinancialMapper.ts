import {
    Payment,
    Charge,
    StudentFinancialInfo,
} from '../../../domain/financial/entities/FinancialEntities';

export class FinancialMapper {
    static toPayment(raw: any): Payment {
        return Payment.create({
            id: raw._id?.toString() || raw.id,
            studentId: raw.studentId?.toString() || raw.studentId,
            chargeId: raw.chargeId?.toString() || raw.chargeId || '',
            amount: raw.amount,
            status: raw.status,
            method: raw.method,
            date: new Date(raw.date || raw.createdAt),
            orderId: raw.orderId,
            currency: raw.currency,
            description: raw.description,
            metadata: raw.metadata,
        });
    }

    static toCharge(raw: any): Charge {
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
            id: raw._id?.toString() || raw.id,
            title: raw.title,
            description: raw.description,
            amount: raw.amount,
            term: raw.term,
            dueDate: new Date(raw.dueDate),
            applicableFor,
            createdBy: raw.createdBy?.toString() || '',
            createdAt: new Date(raw.createdAt || Date.now()),
            updatedAt: new Date(raw.updatedAt || Date.now()),
        });
    }

    static toStudentFinancialInfo(raw: any): StudentFinancialInfo {
        return StudentFinancialInfo.create({
            id: raw._id?.toString() || raw.id,
            studentId: raw.studentId?.toString() || raw.studentId,
            chargeId: raw.chargeId?.toString() || raw.chargeId,
            amount: raw.amount,
            paymentDueDate: new Date(raw.paymentDueDate),
            status: raw.status,
            term: raw.term,
            issuedAt: new Date(raw.issuedAt),
            createdAt: new Date(raw.createdAt || Date.now()),
            updatedAt: new Date(raw.updatedAt || Date.now()),
            paidAt: raw.paidAt ? new Date(raw.paidAt) : undefined,
            method: raw.method,
            chargeTitle: raw.chargeTitle,
            chargeDescription: raw.chargeDescription,
        });
    }

    static toPaymentDTO(payment: Payment) {
        return payment.toJSON();
    }

    static toChargeDTO(charge: Charge) {
        return charge.toJSON();
    }

    static toStudentFinancialInfoDTO(info: StudentFinancialInfo) {
        return info.toJSON();
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
            createdAt: charge.createdAt,
            updatedAt: charge.updatedAt,
        };
    }
}
