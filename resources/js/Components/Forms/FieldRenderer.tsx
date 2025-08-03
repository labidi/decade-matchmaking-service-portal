import React, {useState, useMemo, useCallback} from 'react';
import {UIField} from '@/types';
import {Field, Label, Description, ErrorMessage, Fieldset, Legend} from '@/components/ui/fieldset';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {RadioGroup, RadioField, Radio} from '@/components/ui/radio';
import {CheckboxGroup, CheckboxField, Checkbox} from '@/components/ui/checkbox';
import {ChevronsUpDown} from 'lucide-react';
import {Combobox, ComboboxInput, ComboboxButton, ComboboxOption, ComboboxOptions} from '@headlessui/react';
import { Text } from '@/components/ui/text'

interface FieldRendererProps {
    name: string;
    field: UIField;
    value: any;
    error?: string;
    onChange: (name: string, value: any) => void;
    formData: any;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
    disabled?: boolean;
    className?: string;
}

// Field type registry for custom field types
const fieldTypeRegistry = new Map<string, React.ComponentType<any>>();

export function registerFieldType(type: string, component: React.ComponentType<any>) {
    fieldTypeRegistry.set(type, component);
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    }) as T;
}

export default function FieldRenderer({
    name,
    field,
    value,
    error,
    onChange,
    formData,
    onKeyDown,
    onBlur,
    disabled,
    className
}: Readonly<FieldRendererProps>) {
    const [comboboxQuery, setComboboxQuery] = useState('');

    // Field validation
    const validateField = useCallback((value: any, field: UIField): string | null => {
      /*  if (field.required && (!value || value.toString().trim() === '')) {
            return `${field.label || field.id} is required`;
        }*/

        if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
            return `${field.label || field.id} format is invalid`;
        }

        if (field.min && value < field.min) {
            return `${field.label || field.id} must be at least ${field.min}`;
        }

        if (field.max && value > field.max) {
            return `${field.label || field.id} cannot exceed ${field.max}`;
        }

        if (field.maxLength && value && value.toString().length > field.maxLength) {
            return `${field.label || field.id} cannot exceed ${field.maxLength} characters`;
        }

        return null;
    }, []);

    // Accessibility attributes
    const getAriaAttributes = useCallback((field: UIField, error?: string) => ({
        'aria-invalid': !!error,
        'aria-describedby': error ? `${field.id}-error` : undefined,
        'aria-required': field.required,
    }), []);

    // Performance optimization: Memoize filtered options
    // Only calculate selectedValues for field types that use arrays
    const selectedValues = useMemo(() => {
        if (field.type === 'multiselect' || field.type === 'checkbox-group') {
            return Array.isArray(value) ? value.map((v: any) => String(v)) : [];
        }
        return [];
    }, [value, field.type]);

    const filteredOptions = useMemo(() => {
        let options = field.options ?? [];
        if (!comboboxQuery) return options;
        const filtered = options.filter(opt =>
            opt.label.toString().toLowerCase().includes(comboboxQuery.toLowerCase()) ||
            opt.value.toString().toLowerCase().includes(comboboxQuery.toLowerCase())
        );

        // For multiselect, hide already selected options
        if (field.type === 'multiselect') {
            return filtered.filter(opt => !selectedValues.includes(String(opt.value)));
        }

        return filtered;
    }, [field.options, comboboxQuery, selectedValues, field.type]);

    // Debounced onChange for search fields
    const debouncedOnChange = useMemo(() =>
        field.type === 'search' ? debounce(onChange, 300) : onChange,
        [onChange, field.type]
    );

    // Keyboard event handling
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (field.onKeyDown) {
            field.onKeyDown(e);
        }
        if (onKeyDown) {
            onKeyDown(e);
        }
    }, [field.onKeyDown, onKeyDown]);

    // Blur event handling
    const handleBlur = useCallback((e: React.FocusEvent) => {
        if (onBlur) {
            onBlur(e);
        }
        // Validate on blur
        const validationError = validateField(value, field);
        if (validationError && !error) {
            // Could trigger validation callback here
        }
    }, [onBlur, validateField, value, field, error]);

    // Enhanced change handler with validation support
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newValue = e.currentTarget.value;
        (field.type === 'search' ? debouncedOnChange : onChange)(name, newValue);
    }, [field.type, debouncedOnChange, onChange, name]);

    // Render error helper
    const renderError = useCallback(() =>
        error && <ErrorMessage id={`${field.id}-error`}>{error}</ErrorMessage>,
        [error, field.id]
    );

    // Common field props
    const getCommonFieldProps = useCallback(() => ({
        id: field.id,
        required: field.required,
        disabled: field.disabled || disabled,
        readOnly: field.readOnly,
        autoFocus: field.autoFocus,
        autoComplete: field.autoComplete,
        onKeyDown: handleKeyDown,
        onBlur: handleBlur,
        ...getAriaAttributes(field, error),
    }), [field, disabled, handleKeyDown, handleBlur, getAriaAttributes, error]);

    // Check for custom field type
    const CustomComponent = fieldTypeRegistry.get(field.type);
    if (CustomComponent) {
        return (
            <Field key={name} className={field.className || className || "mt-8"}>
                {field.label && <Label>{field.label}</Label>}
                {field.description && <Description>{field.description}</Description>}
                <CustomComponent
                    {...getCommonFieldProps()}
                    value={value}
                    onChange={(newValue: any) => onChange(name, newValue)}
                    field={field}
                    formData={formData}
                />
                {renderError()}
            </Field>
        );
    }

    const handleComboboxChange = (newValue: any) => {
        onChange(name, newValue);
        setComboboxQuery(''); // reset query on select
    };

    const handleMultiselectChange = (values: any[]) => {
        onChange(name, values.map(String));
        setComboboxQuery(''); // reset query on select
    };

    const handleCheckboxChange = (optionValue: string) => {
        const arr = Array.isArray(value) ? [...value] : [];
        if (arr.includes(optionValue)) {
            onChange(name, arr.filter((i: string) => i !== optionValue));
        } else {
            onChange(name, [...arr, optionValue]);
        }
    };

    const handleRemoveChip = (chipValue: string) => {
        const currentValues = Array.isArray(value) ? value.map((v: any) => String(v)) : [];
        onChange(name, currentValues.filter((v: string) => v !== chipValue));
    };

    if (field.show && !field.show(formData)) {
        return null;
    }

    switch (field.type) {
        case 'hidden':
            return (
                <Field>
                    <Input
                        key={name}
                        type="hidden"
                        id={field.id}
                        value={value ?? ''}
                        onChange={handleChange}
                    />
                </Field>

            );

        case 'text':
        case 'email':
        case 'url':
        case 'number':
        case 'date':
        case 'password':
        case 'search':
        case 'tel':
        case 'time':
        case 'datetime-local':
        case 'month':
        case 'week':
        case 'color':
        case 'range':
            return (
                <Field key={name} className="mt-8 grid grid-cols-subgrid sm:col-span-3">
                    {field.label && <Label>{field.label}</Label>}
                    {field.description && <Description>{field.description}</Description>}
                    <Input
                        type={field.type}
                        id={field.id}
                        required={field.required}
                        value={value ?? ''}
                        placeholder={field.placeholder ?? ''}
                        onChange={handleChange}
                        invalid={!!error}
                    />
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </Field>
            );

        case 'textarea':
            return (
                <Field key={name} className="mt-8">
                    {field.label && <Label>{field.label}</Label>}
                    {field.description && <Description>{field.description}</Description>}
                    <Textarea
                        id={field.id}
                        required={field.required}
                        value={value ?? ''}
                        placeholder={field.placeholder ?? ''}
                        onChange={handleChange}
                        invalid={!!error}
                    />
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </Field>
            );

        case 'file':
            return (
                <Field key={name} className="mt-8">
                    {field.label && <Label>{field.label}</Label>}
                    {field.description && <Description>{field.description}</Description>}
                    <Input
                        type="file"
                        id={field.id}
                        accept={field.accept}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const file = e.currentTarget.files ? e.currentTarget.files[0] : null;
                            onChange(name, file);
                        }}
                        invalid={!!error}
                    />
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </Field>
            );

        case 'select':
            return (
                <Field key={name} className="mt-8">
                    {field.label && <Label htmlFor={field.id} className="block font-medium">{field.label}</Label>}
                    {field.description && <Description className="mt-1 text-sm text-gray-500">{field.description}</Description>}
                    <Combobox immediate value={value} onChange={handleComboboxChange}>
                        <div className="relative">
                            <div
                                className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-firefly-500 focus-within:ring-1 focus-within:ring-firefly-500">
                                <ComboboxInput
                                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                    displayValue={(value: string) => {
                                        const option = field.options?.find(opt => opt.value === value);
                                        return option ? option.label : value;
                                    }}
                                    onChange={event => setComboboxQuery(event.target.value)}
                                    placeholder="Select an option..."
                                />
                                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronsUpDown
                                        className="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                </ComboboxButton>
                            </div>
                            <ComboboxOptions
                                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {filteredOptions.map((option) => (
                                    <ComboboxOption
                                        key={option.value}
                                        className={({active}) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                active ? 'bg-firefly-600 text-white' : 'text-gray-900'
                                            }`
                                        }
                                        value={option.value}
                                    >
                                        {({selected, active}) => (
                                            <>
                                                <span
                                                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                    {option.label}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                            active ? 'text-white' : 'text-firefly-600'
                                                        }`}>
                                                        <svg className="h-5 w-5" viewBox="0 0 20 20"
                                                             fill="currentColor">
                                                            <path fillRule="evenodd"
                                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                  clipRule="evenodd"/>
                                                        </svg>
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </ComboboxOption>
                                ))}
                            </ComboboxOptions>
                        </div>
                    </Combobox>
                    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                </Field>
            );
        case 'raw_select':
            return (
                <Field key={name} className="mt-8">
                    {field.label && <Label>{field.label}</Label>}
                    {field.description && <Description>{field.description}</Description>}
                    <select
                        id={field.id}
                        required={field.required}
                        value={value ?? ''}
                        onChange={handleChange}
                        className={`mt-2 block w-full border rounded ${error ? 'border-red-600' : 'border-gray-300'}`}
                    >
                        <option value="">Select an option...</option>
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </Field>
            );
        case 'multiselect': {
            return (
                <div key={name} className="mt-8">
                    {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
                    {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
                    <Combobox
                        value={selectedValues}
                        immediate
                        onChange={handleMultiselectChange}
                        multiple
                    >
                        <div className="relative">
                            <div
                                className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-firefly-500 focus-within:ring-1 focus-within:ring-firefly-500">
                                <ComboboxInput
                                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                    displayValue={() => comboboxQuery}
                                    onChange={event => setComboboxQuery(event.target.value)}
                                    placeholder="Select options..."
                                />
                                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronsUpDown
                                        className="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                </ComboboxButton>
                            </div>
                            <ComboboxOptions
                                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {filteredOptions.map((option) => (
                                    <ComboboxOption
                                        key={option.value}
                                        className={({active}) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                active ? 'bg-firefly-600 text-white' : 'text-gray-900'
                                            }`
                                        }
                                        value={option.value}
                                    >
                                        {({selected, active}) => (
                                            <>
                                                <span
                                                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                    {option.label}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                            active ? 'text-white' : 'text-firefly-600'
                                                        }`}>
                                                        <svg className="h-5 w-5" viewBox="0 0 20 20"
                                                             fill="currentColor">
                                                            <path fillRule="evenodd"
                                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                  clipRule="evenodd"/>
                                                        </svg>
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </ComboboxOption>
                                ))}
                            </ComboboxOptions>
                        </div>
                    </Combobox>
                    {/* Display selected chips */}
                    {selectedValues && selectedValues.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {selectedValues.map((value: string) => {
                                const option = field.options?.find(opt => String(opt.value) === value);
                                return (
                                    <span
                                        key={value}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-firefly-100 text-firefly-800"
                                    >
                                        {option ? option.label : value}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveChip(value)}
                                            className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-firefly-400 hover:bg-firefly-200 hover:text-firefly-500"
                                        >
                                            <span className="sr-only">Remove</span>
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd"
                                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}
                    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                </div>
            );
        }
        case 'radio':
            return (
                <Field key={name} className="mt-8">
                    {field.label && <Label>{field.label}</Label>}
                    {field.description && <Description>{field.description}</Description>}
                    <RadioGroup
                        value={value}
                        onChange={(newValue) => onChange(name, newValue)}
                    >
                        <div className="flex gap-6">
                            {field.options?.map(opt => (
                                <RadioField key={opt.value}>
                                    <Radio value={opt.value}/>
                                    <Label>{opt.label}</Label>
                                </RadioField>
                            ))}
                        </div>
                    </RadioGroup>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </Field>
            );

        case 'checkbox-group':
            return (
                <Fieldset key={name} className="mt-8">
                    {field.label && <Legend>{field.label}</Legend>}
                    {field.image && (
                        <div className="w-full">
                            <img src={field.image} alt="Logo" className="object-cover"/>
                        </div>
                    )}
                    {field.description && <Text>{field.description}</Text>}
                    <CheckboxGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {field.options?.map(opt => (
                            <CheckboxField key={opt.value}>
                                <Checkbox
                                    checked={Array.isArray(value) ? value.includes(opt.value) : false}
                                    onChange={() => handleCheckboxChange(opt.value)}
                                />
                                <Label>{opt.label}</Label>

                            </CheckboxField>
                        ))}
                    </CheckboxGroup>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </Fieldset>
            );

        default:
            return null;
    }
}
