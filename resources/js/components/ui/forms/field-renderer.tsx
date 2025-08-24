import React, {useMemo, useCallback} from 'react';
import {UIField} from '@/types';
import {Field, Label, Description, ErrorMessage, Fieldset, Legend} from '@/components/ui/fieldset';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {RadioGroup, RadioField, Radio} from '@/components/ui/radio';
import {CheckboxGroup, CheckboxField, Checkbox} from '@/components/ui/checkbox';
import {Text} from '@/components/ui/text'
import CSVUpload from './csv-upload';
import SelectField from './SelectField';
import MultiSelectField from './MultiSelectField';

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



    // Accessibility attributes
    const getAriaAttributes = useCallback((field: UIField, error?: string) => ({
        'aria-invalid': !!error,
        'aria-describedby': error ? `${field.id}-error` : undefined,
        'aria-required': field.required,
    }), []);



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
        ...getAriaAttributes(field, error),
    }), [field, disabled, handleKeyDown, getAriaAttributes, error]);

    // Check for custom field type
    const CustomComponent = fieldTypeRegistry.get(field.type);
    if (CustomComponent) {
        return (
            <Field key={name} className={field.className || className || "mt-8"}>
                {field.label && <Label className="capitalize">{field.label}</Label>}
                {field.description && <Description className="capitalize">{field.description}</Description>}
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


    const handleCheckboxChange = (optionValue: string) => {
        const arr = Array.isArray(value) ? [...value] : [];
        if (arr.includes(optionValue)) {
            onChange(name, arr.filter((i: string) => i !== optionValue));
        } else {
            onChange(name, [...arr, optionValue]);
        }
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
        case 'date':
            return (
                <Field key={name} className="mt-8 grid grid-cols-subgrid sm:col-span-3">
                    {field.label && <Label className="capitalize">{field.label}</Label>}
                    {field.description && <Description className="capitalize">{field.description}</Description>}
                    <Input
                        type={field.type}
                        id={field.id}
                        required={field.required}
                        value={value && new Date(value).toISOString().slice(0, 10) || ''}
                        placeholder={field.placeholder ?? ''}
                        onChange={handleChange}
                        invalid={!!error}
                    />
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </Field>
            );
        case 'text':
        case 'email':
        case 'url':
        case 'number':
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
                    {field.label && <Label className="capitalize">{field.label}</Label>}
                    {field.description && <Description className="capitalize">{field.description}</Description>}
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
                    {field.label && <Label className="capitalize">{field.label}</Label>}
                    {field.description && <Description className="capitalize">{field.description}</Description>}
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
            const existingDocuments = formData?.existing_documents || [];
            const hasExistingDocuments = Array.isArray(existingDocuments) && existingDocuments.length > 0;

            return (
                <Field key={name} className="mt-8">
                    {field.label && <Label className="capitalize">{field.label}</Label>}
                    {field.description && <Description className="capitalize">
                        {field.description}
                    </Description>}

                    {/* Show existing documents if any */}
                    {hasExistingDocuments && (
                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <Text className="text-sm font-medium mb-2">Current documents:</Text>
                            <div className="space-y-2">
                                {existingDocuments.map((doc: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4 text-gray-500" fill="currentColor"
                                                 viewBox="0 0 20 20">
                                                <path fillRule="evenodd"
                                                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                            <span
                                                className="text-gray-700 dark:text-gray-300">{doc.name || 'Unnamed document'}</span>
                                            {doc.file_type && (
                                                <span
                                                    className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                                    {doc.file_type.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        {doc.path && (
                                            <a
                                                href={doc.path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Download
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                    {hasExistingDocuments && (
                        <Description className="mt-1 text-xs">
                            Select a new file to replace the existing document(s)
                        </Description>
                    )}
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </Field>
            );

        case 'select':
            return (
                <SelectField
                    key={name}
                    id={field.id}
                    name={name}
                    value={value}
                    onChange={(newValue) => onChange(name, newValue)}
                    options={field.options}
                    placeholder={field.placeholder || "Select an option..."}
                    required={field.required}
                    disabled={field.disabled || disabled}
                    readOnly={field.readOnly}
                    error={error}
                    label={field.label}
                    description={field.description}
                    className="mt-8"
                    invalid={!!error}
                    {...getAriaAttributes(field, error)}
                />
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
        case 'multiselect':
            return (
                <MultiSelectField
                    key={name}
                    id={field.id}
                    name={name}
                    value={value || []}
                    onChange={(newValue) => onChange(name, newValue)}
                    options={field.options}
                    placeholder={field.placeholder || "Select options..."}
                    required={field.required}
                    disabled={field.disabled || disabled}
                    readOnly={field.readOnly}
                    error={error}
                    label={field.label}
                    description={field.description}
                    className="mt-8"
                    invalid={!!error}
                    showChips={true}
                    maxSelections={field.max}
                    {...getAriaAttributes(field, error)}
                />
            );
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
                                    <Label className="capitalize">{opt.label}</Label>
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
                    {field.label && <Legend className="capitalize">{field.label}</Legend>}
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
                    {error && (
                        <Field>
                            <ErrorMessage>{error}</ErrorMessage>
                        </Field>
                    )}
                </Fieldset>
            );

        case 'csv-upload':
            return (
                <CSVUpload
                    key={name}
                    name={name}
                    label={field.label}
                    description={field.description}
                    accept={field.accept}
                    onChange={onChange}
                    error={error}
                    disabled={field.disabled || disabled}
                />
            );

        default:
            return null;
    }
}
