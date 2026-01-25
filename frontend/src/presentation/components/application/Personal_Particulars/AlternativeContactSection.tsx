import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '../../base/Input';
import { Select } from '../../base/Select';
import { PhoneInput } from '../../base/PhoneInput';
import { PersonalFormData } from '../../../../domain/validation/user/PersonalFormSchema';
import { altContactFields } from './options';

export const AlternativeContactSection: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<PersonalFormData>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
      {altContactFields.map((field) =>
        field.type === 'select' ? (
          <div key={field.id} className="flex flex-col">
            <Controller
              name={field.id as keyof PersonalFormData}
              control={control}
              render={({ field: { onChange, value, onBlur, ref } }) => (
                <Select
                  id={field.id}
                  name={field.id}
                  label={field.label}
                  options={field.options || []}
                  value={value as string}
                  onChange={onChange}
                  onBlur={onBlur}
                  ref={ref}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 bg-white"
                  labelClassName="text-cyan-700"
                  error={errors[field.id as keyof PersonalFormData]?.message}
                />
              )}
            />
          </div>
        ) : (
          <div key={field.id} className="flex flex-col">
            <Input
              id={field.id}
              name={field.id}
              label={field.label}
              required={field.required}
              placeholder={field.placeholder}
              className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 bg-white"
              labelClassName="text-cyan-700"
              error={errors[field.id as keyof PersonalFormData]?.message}
            />
          </div>
        )
      )}

      <div className="flex flex-col">
        <PhoneInput
          countryName="altMobileCountry"
          areaName="altMobileArea"
          numberName="altMobileNumber"
          label="Mobile"
          required={true}
          className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 bg-white"
          labelClassName="text-cyan-700"
          countryError={errors.altMobileCountry?.message}
          areaError={errors.altMobileArea?.message}
          numberError={errors.altMobileNumber?.message}
        />
      </div>


      <div className="flex flex-col">
        <PhoneInput
          countryName="altPhoneCountry"
          areaName="altPhoneArea"
          numberName="altPhoneNumber"
          label="Home Telephone"
          className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 bg-white"
          labelClassName="text-cyan-700"
          countryError={errors.altPhoneCountry?.message}
          areaError={errors.altPhoneArea?.message}
          numberError={errors.altPhoneNumber?.message}
        />
      </div>
    </div>
  );
};