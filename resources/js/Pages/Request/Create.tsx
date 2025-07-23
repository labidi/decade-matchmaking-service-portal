import FrontendLayout from '@/Layouts/FrontendLayout';
import {Head} from '@inertiajs/react';
import {useEffect} from 'react';
import {OCDRequest} from '@/types';
import {UIRequestForm} from '@/Forms/UIRequestForm';
import FieldRenderer from '@/Components/Forms/FieldRenderer';
import { useRequestForm } from '@/hooks/useRequestForm';

interface FormOptions {
    subthemes?: Array<{ value: string; label: string }>;
    supportTypes?: Array<{ value: string; label: string }>;
    relatedActivities?: Array<{ value: string; label: string }>;
    deliveryFormats?: Array<{ value: string; label: string }>;
    targetAudiences?: Array<{ value: string; label: string }>;
    deliveryCountries?: Array<{ value: string; label: string }>;
}

interface RequestFormProps {
    request: OCDRequest;
    formOptions: FormOptions;
}


export default function RequestForm({request,formOptions}: Readonly<RequestFormProps>) {
    const {
        form,
        step,
        steps,
        errorSteps,
        handleNext,
        handleBack,
        handleSubmit,
        handleFieldChange,
        setStep,
    } = useRequestForm(request,formOptions);

    type FormDataKeys = keyof typeof form.data;

    // Helper function to get options for a specific field
    const getFieldOptions = (fieldName: string) => {
        const optionsMap: Record<string, keyof FormOptions> = {
            'subthemes': 'subthemes',
            'support_types': 'supportTypes',
            'related_activity': 'relatedActivities',
            'delivery_format': 'deliveryFormats',
            'target_audience': 'targetAudiences',
            'delivery_countries': 'deliveryCountries',
        };

        const optionKey = optionsMap[fieldName];
        return optionKey ? formOptions[optionKey] : undefined;
    };

    // Initialize form data from existing request (if editing)
    useEffect(() => {
        if (request && request.id) {
            form.setData('id', request.id);
            Object.entries(request.detail).forEach(([key, value]) => {
                if (key in form.data && key !== 'id' && key !== 'mode') {
                    form.setData(key as FormDataKeys, value || '');
                }
            });
        }
    }, []);

    return (
        <FrontendLayout>
            <Head title="Submit Request"/>
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

                {/* Form Fields */}
                {Object.entries(UIRequestForm[step - 1].fields).map(([key, field]) => {
                    const fieldOptions = getFieldOptions(key);
                    const enhancedField = fieldOptions ? { ...field, options: fieldOptions } : field;

                    return (
                        <FieldRenderer
                            key={key}
                            name={key}
                            field={enhancedField}
                            value={(form.data as any)[key as FormDataKeys]}
                            error={form.errors[key as FormDataKeys]}
                            onChange={handleFieldChange}
                            formData={form.data}
                        />
                    );
                })}

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
                            handleSubmit('draft');
                        }}
                        disabled={form.processing}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {form.processing ? 'Saving...' : 'Save Draft'}
                    </button>
                    {step < 5 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={form.processing}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                handleSubmit('submit');
                            }}
                            disabled={form.processing}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {form.processing ? 'Submitting...' : 'Submit'}
                        </button>
                    )}
                </div>
            </form>
        </FrontendLayout>
    );
}
