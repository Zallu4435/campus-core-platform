// Domain entities for Financial module

export class Payment {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly chargeId: string,
        public readonly amount: number,
        public readonly status: 'Completed' | 'Pending' | 'Failed',
        public readonly method: 'Credit Card' | 'Bank Transfer' | 'Financial Aid' | 'Razorpay' | 'stripe',
        public readonly date: Date,
        public readonly orderId?: string,
        public readonly currency?: string,
        public readonly description?: string,
        public readonly metadata?: Record<string, unknown>
    ) { }

    static create(props: {
        id: string;
        studentId: string;
        chargeId: string;
        amount: number;
        status: 'Completed' | 'Pending' | 'Failed';
        method: 'Credit Card' | 'Bank Transfer' | 'Financial Aid' | 'Razorpay' | 'stripe';
        date: Date;
        orderId?: string;
        currency?: string;
        description?: string;
        metadata?: Record<string, unknown>;
    }): Payment {
        return new Payment(
            props.id,
            props.studentId,
            props.chargeId,
            props.amount,
            props.status,
            props.method,
            props.date,
            props.orderId,
            props.currency,
            props.description,
            props.metadata
        );
    }

    toJSON() {
        return {
            id: this.id,
            studentId: this.studentId,
            chargeId: this.chargeId,
            amount: this.amount,
            status: this.status,
            method: this.method,
            date: this.date.toISOString(),
            orderId: this.orderId,
            currency: this.currency,
            description: this.description,
            metadata: this.metadata,
        };
    }
}

export class Charge {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string,
        public readonly amount: number,
        public readonly term: string,
        public readonly dueDate: Date,
        public readonly applicableFor: Record<string, unknown>,
        public readonly createdBy: string,
        public readonly status: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    static create(props: {
        id: string;
        title: string;
        description: string;
        amount: number;
        term: string;
        dueDate: Date;
        applicableFor: Record<string, unknown>;
        createdBy: string;
        status?: string;
        createdAt: Date;
        updatedAt: Date;
    }): Charge {
        return new Charge(
            props.id,
            props.title,
            props.description,
            props.amount,
            props.term,
            props.dueDate,
            props.applicableFor,
            props.createdBy,
            props.status || 'Active',
            props.createdAt,
            props.updatedAt
        );
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            amount: this.amount,
            term: this.term,
            dueDate: this.dueDate.toISOString(),
            applicableFor: this.applicableFor,
            createdBy: this.createdBy,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}

export class StudentFinancialInfo {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly chargeId: string,
        public readonly amount: number,
        public readonly paymentDueDate: Date,
        public readonly status: 'Paid' | 'Pending',
        public readonly term: string,
        public readonly issuedAt: Date,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly paidAt?: Date,
        public readonly method?: string,
        public readonly chargeTitle?: string,
        public readonly chargeDescription?: string
    ) { }

    static create(props: {
        id: string;
        studentId: string;
        chargeId: string;
        amount: number;
        paymentDueDate: Date;
        status: 'Paid' | 'Pending';
        term: string;
        issuedAt: Date;
        createdAt: Date;
        updatedAt: Date;
        paidAt?: Date;
        method?: string;
        chargeTitle?: string;
        chargeDescription?: string;
    }): StudentFinancialInfo {
        return new StudentFinancialInfo(
            props.id,
            props.studentId,
            props.chargeId,
            props.amount,
            props.paymentDueDate,
            props.status,
            props.term,
            props.issuedAt,
            props.createdAt,
            props.updatedAt,
            props.paidAt,
            props.method,
            props.chargeTitle,
            props.chargeDescription
        );
    }

    toJSON() {
        return {
            id: this.id,
            studentId: this.studentId,
            chargeId: this.chargeId,
            amount: this.amount,
            paymentDueDate: this.paymentDueDate.toISOString(),
            status: this.status,
            term: this.term,
            issuedAt: this.issuedAt.toISOString(),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            paidAt: this.paidAt?.toISOString(),
            method: this.method,
            chargeTitle: this.chargeTitle,
            chargeDescription: this.chargeDescription,
        };
    }
}
