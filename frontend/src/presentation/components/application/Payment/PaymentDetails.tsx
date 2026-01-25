import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  FaCreditCard,
  FaLock
} from 'react-icons/fa';
import type { PaymentDetailsProps } from '../../../../domain/types/application';
import { PAYMENT_CONFIG } from '../../../../shared/config/paymentConfig';

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  amount,
  currency,
  onSubmit
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card details are required');
      return;
    }

    if (!name.trim()) {
      setError('Cardholder name is required');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: name.trim()
        }
      });

      if (error) {
        setError(error.message || 'Payment method creation failed');
        setProcessing(false);
        return;
      }

      if (paymentMethod) {
        onSubmit({ paymentMethodId: paymentMethod.id });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || PAYMENT_CONFIG.APPLICATION_FEE_CURRENCY
    }).format(val);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <FaCreditCard className="text-gray-500" />
          Cardholder Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name as it appears on card"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <FaLock className="text-green-600" />
          Card Details
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: {
                color: '#9e2146',
                iconColor: '#9e2146'
              },
            },
            hidePostalCode: true
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="bg-cyan-50 border-l-4 border-cyan-400 p-3 rounded text-sm text-cyan-800">
        <strong>Total Payment:</strong> {formatCurrency(amount || PAYMENT_CONFIG.APPLICATION_FEE_AMOUNT)}
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`
          w-full px-4 py-3 rounded-lg text-white font-semibold 
          transition-all duration-300
          ${processing || !stripe
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md'}
        `}
      >
        {processing ? 'Processing...' : `Pay ${formatCurrency(amount || PAYMENT_CONFIG.APPLICATION_FEE_AMOUNT)}`}
      </button>

      <div className="text-center mt-4 text-xs text-gray-500 flex items-center justify-center gap-2">
        <FaLock />
        Secure payment powered by Stripe. Your card details are encrypted.
      </div>
    </form>
  );
};

export default PaymentDetails;