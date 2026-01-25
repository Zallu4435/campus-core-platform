
import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label?: string;
  error?: string;
  labelClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, FormInputProps>(({
  id,
  name,
  label,
  placeholder,
  type = "text",
  required,
  disabled,
  className = "",
  labelClassName = "",
  error,
  ...rest
}, ref) => {
  const formContext = useFormContext();
  const isUsingFormContext = !!formContext && !rest.onChange;

  const register = isUsingFormContext ? formContext.register(name) : {};

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium mb-1 ${error ? 'text-red-600' : labelClassName}`}
        >
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
          : className
          }`}
        ref={ref}
        {...register}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
