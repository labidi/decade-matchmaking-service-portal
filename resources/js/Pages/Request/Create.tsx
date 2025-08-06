import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import React from 'react';
import {Head, usePage} from '@inertiajs/react';
import {OCDRequest} from '@/types';
import {UIRequestForm} from '@/Forms/UIRequestForm';
import FieldRenderer from '@/components/ui/forms/field-renderer';
import {useRequestForm} from "@/hooks/useRequestForm";

interface FormOptions {
    subthemes?: Array<{ value: string; label: string }>;
    support_types?: Array<{ value: string; label: string }>;
    related_activity?: Array<{ value: string; label: string }>;
    delivery_formats?: Array<{ value: string; label: string }>;
    target_audiences?: Array<{ value: string; label: string }>;
    delivery_countries?: Array<{ value: string; label: string }>;
}

type RequestFormProps = {
    formOptions: FormOptions;
    OCDRequest?: OCDRequest;
}

type Mode = 'submit' | 'draft';
type Id = '';
export default function RequestForm({OCDRequest, formOptions}: Readonly<RequestFormProps>) {
    const ocdRequestFormData = usePage().props.request as OCDRequest;
    const {
        form,
        step,
        steps,
        errorSteps,
        handleNext,
        handleBack,
        handleSubmit,
        handleFieldChange,
        setStep
    } = useRequestForm(ocdRequestFormData);

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
                {Object.entries(UIRequestForm[step - 1].fields).map(([key, field]) => {
                    type FormDataKeys = keyof typeof form.data;
                    // Check if there are formOptions for this field key and assign them
                    const fieldWithOptions = {...field};
                    if (formOptions?.[key as keyof FormOptions]) {
                        fieldWithOptions.options = formOptions[key as keyof FormOptions];
                    }
                    return (
                        <FieldRenderer
                            key={key}
                            name={key}
                            field={fieldWithOptions}
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
                        {form.processing? 'Saving...' : 'Save Draft'}
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
