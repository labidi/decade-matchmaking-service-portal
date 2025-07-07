import {Head, useForm, usePage, router} from '@inertiajs/react';
import React, {useEffect, useState} from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import {UIOpportunityForm, UIField, Opportunity as OpportunityFields} from '@/Forms/UIOpportunityForm';
import TagsInput from '@/Components/ui/TagsInput';
import XHRAlertDialog from '@/Components/Dialogs/XHRAlertDialog';
import {countryOptions, regionOptions, oceanOptions} from '@/data/locations';
import {OCDOpportunity} from '@/types';
import {Combobox, ComboboxInput, ComboboxButton, ComboboxOption, ComboboxOptions} from '@headlessui/react';
import {ChevronsUpDown} from 'lucide-react';

type SimpleTag = { id: string; text: string };

export default function CreateOpportunity() {
    const OcdOpportunityData = usePage().props.request as OCDOpportunity || {};
    const {data, setData, post, processing, errors, setError, clearErrors} = useForm({
        id: OcdOpportunityData?.id || '',
        title: OcdOpportunityData?.title || '',
        type: OcdOpportunityData?.type || '',
        closing_date: OcdOpportunityData?.closing_date || '',
        coverage_activity: OcdOpportunityData?.coverage_activity || '',
        implementation_location: OcdOpportunityData?.implementation_location || '',
        target_audience: OcdOpportunityData?.target_audience || '',
        target_audience_other: OcdOpportunityData?.target_audience_other || '',
        summary: OcdOpportunityData?.summary || '',
        url: OcdOpportunityData?.url || '',
        key_words: OcdOpportunityData?.keywords ? OcdOpportunityData.keywords.split(',') : [],
    });

    const [xhrdialogOpen, setXhrDialogOpen] = useState(false);
    const [xhrdialogResponseMessage, setXhrDialogResponseMessage] = useState('');
    const [xhrdialogResponseType, setXhrDialogResponseType] = useState<'success' | 'error' | 'info' | 'redirect'>('info');
    const [implementationOptions, setImplementationOptions] = useState<{ value: string; label: string }[]>([]);
    // Query state for each combobox field
    const [comboboxQueries, setComboboxQueries] = useState<Record<string, string>>({});

    useEffect(() => {
        switch (data.coverage_activity) {
            case 'country':
                setImplementationOptions(countryOptions);
                break;
            case 'Regions':
                setImplementationOptions(regionOptions);
                break;
            case 'Ocean-based':
                setImplementationOptions(oceanOptions);
                break;
            case 'Global':
                setImplementationOptions([{value: 'Global', label: 'Global'}]);
                break;
            default:
                setImplementationOptions([]);
        }
        setData('implementation_location', '');
    }, [data.coverage_activity]);

    const getInputClass = (fieldName: keyof typeof errors) => {
        return `mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors[fieldName] ? 'border-red-600' : ''}`;
    };

    // Helper to get filtered options for a field
    const getFilteredOptions = (field: UIField, name: string) => {
        const query = comboboxQueries[name] || '';
        let options = field.options ?? [];
        if (name === 'implementation_location') {
            options = implementationOptions;
        }
        if (!query) return options;
        return options.filter(opt =>
            opt.label.toLowerCase().includes(query.toLowerCase()) ||
            opt.value.toLowerCase().includes(query.toLowerCase())
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        post(route('partner.opportunity.store'), {
            onSuccess: () => {
                setXhrDialogResponseMessage('Opportunity created successfully!');
                setXhrDialogResponseType('redirect');
                setXhrDialogOpen(true);
            },
            onError: (err) => {
                setError(err as any);
            },
        });
    };

    type FormDataKeys = keyof typeof data;

    const renderField = (name: FormDataKeys, field: UIField) => {
        if (field.show && !field.show(data as OpportunityFields)) {
            return null;
        }
        const error = errors[name];
        switch (field.type) {
            case 'text':
            case 'date':
                return (
                    <div key={name} className="mt-4">
                        {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
                        {field.description && <p className="mt-1 text-base text-gray-500">{field.description}</p>}
                        <input
                            id={field.id}
                            type={field.type}
                            className={getInputClass(name)}
                            value={data[name] as string}
                            placeholder={field.placeholder}
                            onChange={e => setData(name, e.currentTarget.value)}
                        />
                        {error && <p className="text-red-600 text-base mt-1">{error}</p>}
                    </div>
                );
            case 'textarea':
                return (
                    <div key={name} className="mt-4">
                        {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
                        <textarea
                            id={field.id}
                            className={getInputClass(name)}
                            value={data[name] as string}
                            maxLength={field.maxLength}
                            rows={4}
                            onChange={e => setData(name, e.currentTarget.value)}
                        />
                        {error && <p className="text-red-600 text-base mt-1">{error}</p>}
                    </div>
                );
            case 'select':
                return (
                    <div key={name} className="mt-4">
                        {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
                        {field.description && <p className="mt-1 text-base text-gray-500">{field.description}</p>}
                        <Combobox immediate value={data[name] as string} onChange={(value) => {
                            // @ts-ignore
                            setData(name, value);
                            setComboboxQueries(q => ({...q, [name]: ''}));
                        }}>
                            <div className="relative">
                                <div
                                    className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-firefly-500 focus-within:ring-1 focus-within:ring-firefly-500">
                                    <ComboboxInput
                                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                        displayValue={(value: string) => {
                                            const option = getFilteredOptions(field, name).find(opt => opt.value === value);
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
                        {error && <p className="text-red-600 text-base mt-1">{error}</p>}
                    </div>
                );
            case 'tags':
                const initialTags: SimpleTag[] = (data[name] as string[] || []).map((kw, i) => ({
                    id: String(i),
                    text: kw
                }));
                return (
                    <div key={name} className="mt-4">
                        {field.label && <label htmlFor={field.id} className="block font-medium">{field.label}</label>}
                        {field.description && <p className="mt-1 text-base text-gray-500">{field.description}</p>}
                        <TagsInput
                            initialTags={initialTags as any}
                            onTagsChange={(tags: any) => setData(name, tags.map((t: any) => t.text))}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <FrontendLayout>
            <Head title="Create Opportunity"/>
            <XHRAlertDialog
                open={xhrdialogOpen}
                onOpenChange={setXhrDialogOpen}
                message={xhrdialogResponseMessage}
                type={xhrdialogResponseType}
                onConfirm={() => {
                    setXhrDialogOpen(false);
                    if (xhrdialogResponseType === 'redirect') {
                        router.visit(route(`opportunity.list`), {method: 'get'});
                    }
                }}
            />
            <div className="mx-auto p-6 ">
                <form onSubmit={handleSubmit}>
                    {UIOpportunityForm.map((step, idx) => (
                        <div key={step.label}>
                            <h2 className="text-lg font-bold mt-8 mb-2">{step.label}</h2>
                            {Object.entries(step.fields).map(([key, field]) => renderField(key as FormDataKeys, field))}
                        </div>
                    ))}
                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700"
                        >
                            {processing ? 'Submitting Opportunity...' : 'Submit Opportunity'}
                        </button>
                    </div>
                </form>
            </div>
        </FrontendLayout>
    );
}
