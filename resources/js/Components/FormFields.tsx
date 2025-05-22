// resources/js/Components/FormFields.tsx
import React from 'react';
import { UseFormReturn } from '@inertiajs/react';

// Generic input field (text, email, number, url)
export interface InputFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  type?: string;
  description?: string;
  required?: boolean;
}
export const InputField: React.FC<InputFieldProps> = ({ form, name, label, type = 'text', description, required }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block font-medium">
      {label}{required && ' *'}
    </label>
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    <input
      id={name}
      type={type}
      value={form.data[name] ?? ''}
      onChange={e => form.setData(name, e.currentTarget.value)}
      required={required}
      className="mt-2 block w-full border-gray-300 rounded"
    />
    {form.errors[name] && <p className="text-red-600 mt-1">{form.errors[name]}</p>}
  </div>
);

// Textarea field
export interface TextareaFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  rows?: number;
}
export const TextareaField: React.FC<TextareaFieldProps> = ({ form, name, label, description, required, rows = 4 }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block font-medium">
      {label}{required && ' *'}
    </label>
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    <textarea
      id={name}
      rows={rows}
      value={form.data[name] ?? ''}
      onChange={e => form.setData(name, e.currentTarget.value)}
      required={required}
      className="mt-2 block w-full border-gray-300 rounded"
    />
    {form.errors[name] && <p className="text-red-600 mt-1">{form.errors[name]}</p>}
  </div>
);

// Select field
export interface SelectFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  options: { value: string; label: string }[];
  description?: string;
  required?: boolean;
}
export const SelectField: React.FC<SelectFieldProps> = ({ form, name, label, options, description, required }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block font-medium">
      {label}{required && ' *'}
    </label>
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    <select
      id={name}
      value={form.data[name] ?? ''}
      onChange={e => form.setData(name, e.currentTarget.value)}
      required={required}
      className="mt-2 block w-full border-gray-300 rounded"
    >
      <option value="">— Select —</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {form.errors[name] && <p className="text-red-600 mt-1">{form.errors[name]}</p>}
  </div>
);

// Checkbox group
export interface CheckboxGroupProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  options: string[];
  description?: string;
  required?: boolean;
}
export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ form, name, label, options, description, required }) => (
  <div className="mb-6">
    <label className="block font-medium">
      {label}{required && ' *'}
    </label>
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {options.map(opt => (
        <label key={opt} className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={(form.data[name] as string[]).includes(opt)}
            onChange={() => {
              const arr = form.data[name] as string[];
              form.setData(
                name,
                arr.includes(opt) ? arr.filter(i => i !== opt) : [...arr, opt]
              );
            }}
            required={required && (form.data[name] as string[]).length === 0}
          />
          <span className="ml-2">{opt}</span>
        </label>
      ))}
    </div>
    {form.errors[name] && <p className="text-red-600 mt-1">{form.errors[name]}</p>}
  </div>
);

// Radio group
export interface RadioGroupProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  options: string[];
  description?: string;
  required?: boolean;
}
export const RadioGroup: React.FC<RadioGroupProps> = ({ form, name, label, options, description, required }) => (
  <div className="mb-6">
    <label className="block font-medium">
      {label}{required && ' *'}
    </label>
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    <div className="mt-2 space-x-6">
      {options.map(opt => (
        <label key={opt} className="inline-flex items-center">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={form.data[name] === opt}
            onChange={e => form.setData(name, e.currentTarget.value)}
            className="form-radio"
            required={required}
          />
          <span className="ml-2">{opt}</span>
        </label>
      ))}
    </div>
    {form.errors[name] && <p className="text-red-600 mt-1">{form.errors[name]}</p>}
  </div>
);
