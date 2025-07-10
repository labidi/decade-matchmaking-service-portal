import React, {useState} from 'react';
import {ChevronsUpDown} from 'lucide-react';
import {Combobox, ComboboxInput, ComboboxButton, ComboboxOption, ComboboxOptions} from '@headlessui/react';
import {UIField} from '@/types';
import {Request as RequestFields} from '@/Forms/UIRequestForm';

interface FieldRendererProps {
    name: string;
    field: UIField;
    value: any;
    error?: string;
    onChange: (name: string, value: any) => void;
    formData: any;
}

export default function FieldRenderer({name, field, value, error, onChange, formData}: FieldRendererProps) {
    const [comboboxQuery, setComboboxQuery] = useState('');

    // Helper to get filtered options for a field
    const getFilteredOptions = (field: UIField, selectedValues?: string[]) => {
        let options = field.options ?? [];
        if (!comboboxQuery) return options;

        const filtered = options.filter(opt =>
            opt.label.toLowerCase().includes(comboboxQuery.toLowerCase()) ||
            opt.value.toLowerCase().includes(comboboxQuery.toLowerCase())
        );

        // For multiselect, hide already selected options
        if (selectedValues) {
            return filtered.filter(opt => !selectedValues.includes(String(opt.value)));
        }

        return filtered;
    };

    const getInputClass = () => {
        return `mt-2 block w-full border rounded ${error ? 'border-red-600' : 'border-gray-300'}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        onChange(name, e.currentTarget.value);
    };

    const handleComboboxChange = (newValue: any) => {
        onChange(name, newValue);
        setComboboxQuery(''); // reset query on select
    };

    const handleMultiselectChange = (values: any[]) => {
        onChange(name, values.map(String));
        setComboboxQuery(''); // reset query on select
    };

    const handleCheckboxChange = (optionValue: string) => {
        const arr = [...(value || [])];
        if (arr.includes(optionValue)) {
            onChange(name, arr.filter((i: string) => i !== optionValue));
        } else {
            onChange(name, [...arr, optionValue]);
        }
    };

    const handleRemoveChip = (chipValue: string) => {
        const selectedValues = (value || []).map((v: any) => String(v));
        onChange(name, selectedValues.filter((v: string) => v !== chipValue));
    };

    if (field.show && !field.show(formData as RequestFields)) {
        return null;
    }

    const common = {
        id: field.id,
        required: field.required,
        className: getInputClass(),
        value: value || '',
        placeholder: field.placeholder || '',
        onChange: handleChange,
    };

    switch (field.type) {
        case 'hidden':
            return (
                <input key={name} type="hidden" {...common} />
            );

        case 'text':
        case 'email':
        case 'url':
        case 'number':
        case 'date':
            return (
                <div key={name} className="mt-8">
                    {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
                    {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
                    <input type={field.type} {...common} />
                    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                </div>
            );

        case 'textarea':
            return (
                <div key={name} className="mt-8">
                    {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
                    {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
                    <textarea {...common} />
                    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                </div>
            );

        case 'file':
            return (
                <div key={name} className="mt-8">
                    {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
                    {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
                    <input
                        type="file"
                        id={field.id}
                        accept={field.accept}
                        className={getInputClass()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const file = e.currentTarget.files ? e.currentTarget.files[0] : null;
                            onChange(name, file);
                        }}
                    />
                    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                </div>
            );

        case 'select':
            return (
                <div key={name} className="mt-8">
                    {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
                    {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
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
                                {getFilteredOptions(field).map((option) => (
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
                </div>
            );
        case 'raw_select':
            return (
                <div key={name} className="mt-8">
                    {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
                    {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
                    <select key={name} {...common}>
                        <option value="" >Select an option...</option>
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                </div>
            );
        case 'multiselect':
            const selectedValues = (value || []).map((v: any) => String(v));
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
                                {getFilteredOptions(field, selectedValues).map((option) => (
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

        case 'radio':
            return (
                <div key={name} className="mt-8">
                    <label className="block font-medium">{field.label}</label>
                    {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
                    <div className="mt-2 space-x-6">
                        {field.options?.map(opt => (
                            <label key={opt.value} className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name={field.id}
                                    value={opt.value}
                                    checked={value === opt.value}
                                    onChange={handleChange}
                                    className={`form-radio ${error ? 'border-red-600' : 'border-gray-300'}`}
                                />
                                <span className={`ml-2 ${error ? 'text-red-600' : 'text-gray'}`}>{opt.label}</span>
                            </label>
                        ))}
                    </div>
                    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                </div>
            );

        case 'checkbox-group':
            return (
                <fieldset key={name} className="mt-8">
                    <legend className="block font-medium mb-2">{field.label}</legend>
                    {(field.image) && (
                        <div className="w-full">
                            <img src={field.image} alt="Logo" className="object-cover"/>
                        </div>
                    )}
                    {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        {field.options?.map(opt => (
                            <label key={opt.value} className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className={`form-checkbox ${error ? 'border-red-600' : 'border-gray-300'}`}
                                    checked={(value || []).includes(opt.value)}
                                    onChange={() => handleCheckboxChange(opt.value)}
                                />
                                <span className="ml-2"> {opt.label}</span>
                            </label>
                        ))}
                    </div>
                    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                </fieldset>
            );

        default:
            return null;
    }
}
