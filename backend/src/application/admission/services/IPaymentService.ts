export interface PaymentDetails {
    method: string;
    amount: number;
    currency: string;
    paymentMethodId: string;
    returnUrl?: string;
}

export interface PaymentResult {
    paymentId: string;
    status: string;
    message: string;
    clientSecret?: string | null;
    stripePaymentIntentId?: string;
}

export interface IPaymentService {
    createPaymentIntent(amount: number, currency: string, paymentMethodId?: string, metadata?: Record<string, string>): Promise<{ id: string; client_secret: string | null }>;
    confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<{ status: string }>;
}
