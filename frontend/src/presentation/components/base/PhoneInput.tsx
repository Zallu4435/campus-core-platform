import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FormPhoneInputProps {
  countryName: string;
  areaName: string;
  numberName: string;
  label?: string;
  required?: boolean;
  countryError?: string;
  areaError?: string;
  numberError?: string;
  className?: string;
  labelClassName?: string;
}

export const PhoneInput: React.FC<FormPhoneInputProps> = ({
  countryName,
  areaName,
  numberName,
  label,
  required = false,
  countryError,
  areaError,
  numberError,
  className = "",
  labelClassName = "",
}) => {
  const { register } = useFormContext();
  const hasError = countryError || areaError || numberError;

  return (
    <div className="mb-4">
      {label && (
        <label className={`block text-sm font-medium mb-1 ${hasError ? 'text-red-600' : labelClassName}`}>
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex space-x-2">
        <div className="w-24">
          <input
            {...register(countryName)}
            placeholder="Country"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${countryError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                : className
              }`}
          />
          {countryError && (
            <p className="mt-1 text-sm text-red-600">{countryError}</p>
          )}
        </div>
        <div className="w-24">
          <input
            {...register(areaName)}
            placeholder="Area"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${areaError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                : className
              }`}
          />
          {areaError && (
            <p className="mt-1 text-sm text-red-600">{areaError}</p>
          )}
        </div>
        <div className="flex-1">
          <input
            {...register(numberName)}
            placeholder="Number"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${numberError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
                : className
              }`}
          />
          {numberError && (
            <p className="mt-1 text-sm text-red-600">{numberError}</p>
          )}
        </div>
      </div>
    </div>
  );
};