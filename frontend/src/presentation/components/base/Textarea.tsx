import React from 'react';
import { useFormContext } from 'react-hook-form';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  name?: string; // Add name for react-hook-form integration
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  maxLength?: number;
  rows?: number;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  id,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  labelClassName = "",
  maxLength,
  rows = 4,
  error,
  ...props
}) => {
  const formContext = useFormContext();

  // If we have form context and a name, watch the value
  const watchedValue = (formContext && name) ? formContext.watch(name) : undefined;

  // Use watchedValue if available, otherwise fallback to props.value or empty string
  const displayValue = watchedValue ?? props.value ?? (props.defaultValue ?? "");
  const currentLength = typeof displayValue === 'string' ? displayValue.length : 0;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label}{required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        rows={rows}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      <div className="flex justify-between mt-1">
        {error && <p className="text-sm text-red-700">{error}</p>}
        {maxLength && (
          <span className="text-sm text-gray-500">
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
};