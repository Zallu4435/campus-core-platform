import Stripe from "stripe";
import { IPaymentService, PaymentDetails } from "../../../application/admission/services/IPaymentService";
import Logger from "../../../shared/utils/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-04-30.basil" });

export class PaymentService implements IPaymentService {
    async createPaymentIntent(amount: number, currency: string, paymentMethodId?: string, metadata?: Record<string, string>): Promise<{ id: string; client_secret: string | null }> {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase(),
                automatic_payment_methods: { enabled: true, allow_redirects: "never" },
                confirm: false,
                payment_method: paymentMethodId,
                metadata: metadata
            });
            return {
                id: paymentIntent.id,
                client_secret: paymentIntent.client_secret
            };
        } catch (error) {
            Logger.error("Stripe createPaymentIntent error:", error);
            throw new Error("Failed to create payment intent");
        }
    }

    async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<{ status: string }> {
        try {
            const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId,
            });
            return { status: paymentIntent.status };
        } catch (error) {
            Logger.error("Stripe confirmPayment error:", error);
            throw new Error("Failed to confirm payment");
        }
    }
}
