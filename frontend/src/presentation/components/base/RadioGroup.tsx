import React from 'react';

interface RadioOption {
  label: string;
  value: string | boolean;
}

interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  selectedValue: string | boolean | null;
  onChange: (value: string | boolean) => void;
  required?: boolean;
  className?: string;
  error?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  selectedValue,
  onChange,
  required = false,
  className = '',
  error,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <p className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
      )}
      <div className={`flex space-x-4 p-2 rounded-md ${error ? 'border border-red-500 bg-red-50/30' : ''}`}>
        {options.map((option, index) => (
          <label key={index} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={selectedValue === option.value}
              onChange={() => onChange(option.value)}
              className={`h-4 w-4 ${error ? 'text-red-600 focus:ring-red-500' : 'text-blue-600 focus:ring-blue-500'}`}
            />
            <span className={error ? 'text-red-700' : ''}>{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
