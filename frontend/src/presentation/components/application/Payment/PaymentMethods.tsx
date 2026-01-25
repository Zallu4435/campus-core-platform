import React from 'react';
import {
  FaStripe
} from 'react-icons/fa';
import { PaymentMethodsProps } from '../../../../domain/types/application';

const paymentMethods = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: FaStripe,
    description: 'Secure online payment gateway'
  },
];


export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedMethod,
  onMethodSelect,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-cyan-900">Select Payment Method</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => onMethodSelect(method.id)}
              className={`
                p-4 border rounded-lg flex items-center space-x-4 
                transition-all duration-300 group
                ${selectedMethod === method.id
                  ? 'border-cyan-500 bg-cyan-50 shadow-md'
                  : 'border-gray-200 hover:border-cyan-300 hover:bg-cyan-25'}
              `}
            >
              <div className={`
                p-3 rounded-full transition-colors
                ${selectedMethod === method.id
                  ? 'bg-cyan-100 text-cyan-600'
                  : 'bg-gray-100 text-gray-500 group-hover:bg-cyan-50 group-hover:text-cyan-600'}
              `}>
                <IconComponent size={24} />
              </div>
              <div className="text-left flex-grow">
                <h4 className={`
                  font-medium 
                  ${selectedMethod === method.id
                    ? 'text-cyan-900'
                    : 'text-gray-800 group-hover:text-cyan-900'}
                `}>
                  {method.name}
                </h4>
                <p className="text-xs text-gray-500 group-hover:text-gray-600">
                  {method.description}
                </p>
              </div>
              {selectedMethod === method.id && (
                <div className="ml-auto text-cyan-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Select a payment method to proceed with your application fee payment
      </p>
    </div>
  );
};