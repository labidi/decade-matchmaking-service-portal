import FrontendLayout from '@/Layouts/FrontendLayout';
import React, {useEffect, useState} from 'react';
import XHRAlertDialog from '@/Components/Dialogs/XHRAlertDialog';
import {ChevronsUpDown} from 'lucide-react'
import {Combobox, ComboboxInput, ComboboxButton, ComboboxOption, ComboboxOptions} from '@headlessui/react'
import {Head, router, useForm, usePage} from '@inertiajs/react';
import {OCDRequest} from '@/types';
import {UIRequestForm, UIField, Request as RequestFields} from '@/Forms/UIRequestForm';
import {submitRequest} from '@/Services/Api/request';


type Mode = 'submit' | 'draft';
type Id = '';
export default function RequestForm() {

    const ocdRequestFormData = usePage().props.request as OCDRequest;
    const form = useForm({
        id: '',
        is_partner: '',
        unique_id: '',
        first_name: '',
        last_name: '',
        email: '',
        capacity_development_title: '',
        has_significant_changes: '',
        changes_description: '',
        change_effect: '',
        request_link_type: '',
        project_stage: '',
        project_url: '',
        related_activity: '',
        subthemes: [] as string[],
        subthemes_other: '',
        support_types: [] as string[],
        support_types_other: '',
        gap_description: '',
        has_partner: '',
        partner_name: '',
        partner_confirmed: '',
        needs_financial_support: '',
        budget_breakdown: '',
        support_months: '',
        completion_date: '',
        risks: '',
        personnel_expertise: '',
        direct_beneficiaries: '',
        direct_beneficiaries_number: '',
        expected_outcomes: '',
        success_metrics: '',
        long_term_impact: '',
        mode: 'submit' as Mode,
        target_audience: '',
        target_audience_other: '',
        delivery_format: '',
        delivery_country: '',
    });


    type FormDataKeys = keyof typeof form.data;

    const [step, setStep] = useState(1);
    const steps = UIRequestForm.map((s) => s.label);
    const [errorSteps, setErrorSteps] = useState<number[]>([]);

    const [xhrdialogOpen, setXhrDialogOpen] = useState(false);
    const [xhrdialogResponseMessage, setXhrDialogResponseMessage] = useState('');
    const [xhrdialogResponseType, setXhrDialogResponseType] = useState<'success' | 'error' | 'info' | 'redirect' | 'loading'>('info');
    const [isLoading, setIsLoading] = useState(false);

    // Query state for each combobox field
    const [comboboxQueries, setComboboxQueries] = useState<Record<string, string>>({});

    // Helper to get filtered options for a field
    const getFilteredOptions = (field: UIField, name: string, selectedValues?: string[]) => {
        const query = comboboxQueries[name] || '';
        let options = field.options ?? [];
        // For multiselect, hide already selected options
        if (!query) return options;
        return options.filter(opt =>
            opt.label.toLowerCase().includes(query.toLowerCase()) ||
            opt.value.toLowerCase().includes(query.toLowerCase())
        );
    };

    const getInputClass = (fieldName: keyof typeof form.errors) => {
        return `mt-2 block w-full border rounded ${form.errors[fieldName] ? 'border-red-600' : 'border-gray-300'}`;
    };

    const handleNext = () => {
        setStep(prev => Math.min(prev + 1, steps.length));
    };

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmitV2 = async (mode: 'submit' | 'draft') => {
        form.clearErrors();
        form.setData('mode', mode);
        setIsLoading(true);
        setXhrDialogResponseType('loading');
        setXhrDialogResponseMessage(mode === 'draft' ? 'Saving draft...' : 'Submitting request...');
        setXhrDialogOpen(true);
        
        try {
            const responseXhr = await submitRequest(form.data, mode);
            form.setData('id', responseXhr.request_data.id);
            form.setData('unique_id', responseXhr.request_data.unique_id);
            setXhrDialogResponseMessage(responseXhr.request_data.message);
            if (mode === 'draft') {
                setXhrDialogResponseType('success');
                router.push({
                    url: route(`user.request.edit`, {id: responseXhr.request_data.id}),
                    clearHistory: false,
                    encryptHistory: false,
                    preserveScroll: true,
                    preserveState: true,
                });
            } else {
                setXhrDialogResponseType('redirect');
            }
        } catch (responseXhr: any) {
            if (responseXhr.response?.status === 422) {
                form.setError(responseXhr.response.data.errors);
                const stepsWithError: number[] = [];
                Object.keys(responseXhr.response.data.errors).forEach(field => {
                    const idx = UIRequestForm.findIndex(step => step.fields[field]);
                    if (idx !== -1 && !stepsWithError.includes(idx + 1)) {
                        stepsWithError.push(idx + 1);
                    }
                });
                setErrorSteps(stepsWithError);
                setXhrDialogResponseType('error');
                setXhrDialogResponseMessage('Please correct the highlighted errors.');
            } else {
                setXhrDialogResponseType('error');
                setXhrDialogResponseMessage(responseXhr.response?.data?.error || 'Something went wrong');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderField = (name: FormDataKeys, field: UIField) => {
        if (field.show && !field.show(form.data as unknown as RequestFields)) {
            return null;
        }
        const error = form.errors[name];
        const common = {
            id: field.id,
            required: field.required,
            className: getInputClass(name),
            value: (form.data as any)[name],
            placeholder: field.placeholder || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                form.setData(name, e.currentTarget.value),
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
            case 'select':
                return (
                    <div key={name} className="mt-8">
                        {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
                        {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
                        <Combobox immediate value={(form.data as any)[name]} onChange={(value) => {
                            form.setData(name, value);
                            setComboboxQueries(q => ({...q, [name]: ''})); // reset query on select
                        }}>
                            <div className="relative">
                                <div
                                    className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-firefly-500 focus-within:ring-1 focus-within:ring-firefly-500">
                                    <ComboboxInput
                                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                        displayValue={(value: string) => {
                                            const option = field.options?.find(opt => opt.value === value);
                                            return option ? option.label : value;
                                        }}
                                        onChange={event => setComboboxQueries(q => ({
                                            ...q,
                                            [name]: event.target.value
                                        }))}
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
                                    {getFilteredOptions(field, name).map((option) => (
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
                                                            }`}
                                                        >
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
            case 'multiselect':
                const selectedValues = ((form.data as any)[name] || []).map((v: any) => String(v));
                return (
                    <div key={name} className="mt-8">
                        {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
                        {field.description && <p className="mt-1 text-sm text-gray-500">{field.description}</p>}
                        <Combobox
                            value={selectedValues}
                            immediate
                            onChange={(values: any[]) => {
                                form.setData(name, values.map(String));
                                setComboboxQueries(q => ({...q, [name]: ''})); // reset query on select
                            }}
                            multiple
                        >
                            <div className="relative">
                                <div
                                    className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-firefly-500 focus-within:ring-1 focus-within:ring-firefly-500">
                                    <ComboboxInput
                                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                        displayValue={() => comboboxQueries[name] || ''}
                                        onChange={event => setComboboxQueries(q => ({
                                            ...q,
                                            [name]: event.target.value
                                        }))}
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
                                    {getFilteredOptions(field, name, selectedValues).map((option) => (
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
                                                            }`}
                                                        >
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
                                                onClick={() => {
                                                    form.setData(name, selectedValues.filter((v: string) => v !== value));
                                                }}
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
                                        checked={(form.data as any)[name] === opt.value}
                                        onChange={e => form.setData(name, e.currentTarget.value)}
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
                                        checked={(form.data as any)[name].includes(opt.value)}
                                        onChange={() => {
                                            const arr = [...(form.data as any)[name]];
                                            if (arr.includes(opt.value)) {
                                                form.setData(name, arr.filter((i: string) => i !== opt.value));
                                            } else {
                                                form.setData(name, [...arr, opt.value]);
                                            }
                                        }}
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
    };


    useEffect(() => {
        if (ocdRequestFormData && ocdRequestFormData.id) {
            form.setData('id', ocdRequestFormData.id.toString());
            Object.entries(ocdRequestFormData.request_data).forEach(([key, value]) => {
                if (key in form.data) {
                    form.setData(key as FormDataKeys, value || '');
                }
            });
        }
    }, []);

    return (
        <FrontendLayout>
            <Head title="Submit Request"/>
            <XHRAlertDialog
                open={xhrdialogOpen}
                onOpenChange={setXhrDialogOpen}
                message={xhrdialogResponseMessage}
                type={xhrdialogResponseType}
                onConfirm={() => {
                    setXhrDialogOpen(false);
                    if (xhrdialogResponseType === 'redirect') {
                        router.visit(route(`request.me.list`), {method: 'get'});
                    }
                }}
            />
            <form className="mx-auto bg-white">
                <input type="hidden" name="id" value={form.data.id}/>
                <input type="hidden" name="mode" value={form.data.mode}/>
                {/* Stepper */}
                <div className="flex mb-6">
                    {steps.map((label, idx) => (
                        <div key={label} className="flex-1" onClick={() => {
                            setStep(idx + 1)
                        }}>
                            <div
                                className={`w-8 h-8 mx-auto rounded-full text-center leading-8 ${step === idx + 1 ? 'bg-firefly-600 text-white' : 'bg-firefly-200 text-gray-600'
                                } ${errorSteps.includes(idx + 1) && step !== idx + 1 ? 'bg-red-600 text-white' : ''}`}
                            >
                                {idx + 1}
                            </div>
                            <div
                                className={`text-xl text-center mt-2 ${errorSteps.includes(idx + 1) && step !== idx + 1 ? 'text-red-600' : ''}`}>{label}</div>
                        </div>
                    ))}
                </div>
                {Object.entries(UIRequestForm[step - 1].fields).map(([key, field]) =>
                    renderField(key as FormDataKeys, field)
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={step === 1}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            handleSubmitV2('draft');
                        }}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Saving...' : 'Save Draft'}
                    </button>
                    {step < 5 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                handleSubmitV2('submit');
                            }}
                            disabled={isLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    )}
                </div>
            </form>
        </FrontendLayout>
    );
}
