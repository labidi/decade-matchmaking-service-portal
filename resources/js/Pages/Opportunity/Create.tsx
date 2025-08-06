import {Head} from '@inertiajs/react';
import React from 'react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import {UIOpportunityForm} from '@/Forms/UIOpportunityForm';
import {OCDOpportunity} from '@/types';
import FieldRenderer from '@/components/ui/forms/field-renderer';
import {useOpportunityForm} from '@/hooks/useOpportunityForm';
import {Button} from '@/components/ui/button';

interface CreateOpportunityProps {
    opportunity?: OCDOpportunity;
    formOptions?: {
        countries: { value: string; label: string }[];
        regions: { value: string; label: string }[];
        oceans: { value: string; label: string }[];
        targetAudiences: { value: string; label: string }[];
        opportunityTypes: { value: string; label: string }[];
    };
}
export default function CreateOpportunity({opportunity , formOptions}: Readonly<CreateOpportunityProps>) {
    const {
        form,
        currentStep,
        steps,
        handleNext,
        handleBack,
        handleSubmit,
        handleFieldChange,
        getFieldOptions,
    } = useOpportunityForm(opportunity, formOptions);


    return (
        <FrontendLayout>
            <Head title="Create Opportunity"/>
            <div className="mx-auto bg-white p-6">
                <form onSubmit={handleSubmit}>
                    <input type="hidden" name="id" value={form.data.id}/>
                    {/* Current Step Fields */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-6">{UIOpportunityForm[currentStep].label}</h2>
                        {Object.entries(UIOpportunityForm[currentStep].fields).map(([key, field]) => {
                            const fieldWithOptions = {...field};

                            // Assign dynamic options based on field type
                            if (key === 'implementation_location') {
                                fieldWithOptions.options = getFieldOptions('implementation_location');
                            } else if (key === 'type') {
                                fieldWithOptions.options = getFieldOptions('type');
                            } else if (key === 'target_audience') {
                                fieldWithOptions.options = getFieldOptions('target_audience');
                            }

                            type FormDataKeys = keyof typeof form.data;
                            return (
                                <FieldRenderer
                                    key={key}
                                    name={key}
                                    field={fieldWithOptions}
                                    value={form.data[key as FormDataKeys]}
                                    error={form.errors[key as FormDataKeys]}
                                    onChange={handleFieldChange}
                                    formData={form.data}
                                />
                            );
                        })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                        <Button
                            type="button"
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Back
                        </Button>

                        {currentStep < steps.length - 1 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={form.processing}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {form.processing ? 'Submitting Opportunity...' : 'Submit Opportunity'}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </FrontendLayout>
    );
}
