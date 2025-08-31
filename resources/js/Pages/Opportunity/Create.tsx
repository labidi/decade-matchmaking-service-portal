import {Head} from '@inertiajs/react';
import React from 'react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import {UIOpportunityForm} from '@/components/forms/UIOpportunityForm';
import {Opportunity, OpportunityFormOptions} from '@/types';
import FieldRenderer from '@/components/ui/forms/field-renderer';
import {useOpportunityForm} from '@/hooks/useOpportunityForm';
import {Button} from '@/components/ui/button';

interface CreateOpportunityProps {
    opportunity?: Opportunity;
    formOptions?: OpportunityFormOptions;
}

// Helper function to map opportunity field keys to formOptions keys
function getOptionsKeyForOpportunity(fieldKey: string): string | null {
    const keyMap: Record<string, string> = {
        'implementation_location': 'implementation_location', // This is handled dynamically in the hook
        'type': 'opportunity_types',
        'target_audience': 'target_audience',
        'coverage_activity': 'coverage_activity',
        'target_languages': 'target_languages'
    };
    return keyMap[fieldKey] || null;
}

export default function CreateOpportunity({opportunity, formOptions}: Readonly<CreateOpportunityProps>) {
    const {
        form,
        currentStep,
        handleSubmit,
        handleFieldChange,
        implementationOptions,
    } = useOpportunityForm(opportunity, formOptions);


    return (
        <FrontendLayout>
            <Head title="Create Opportunity"/>
            <div>
                <form>
                    <input type="hidden" name="id" value={form.data.id}/>
                    {/* Current Step Fields */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-6">{UIOpportunityForm[currentStep].label}</h2>
                        {Object.entries(UIOpportunityForm[currentStep].fields).map(([key, field]) => {
                            const fieldWithOptions = {...field};

                            // Assign dynamic options based on field type
                            if (key === 'implementation_location') {
                                // Use dynamic options from hook for implementation location
                                fieldWithOptions.options = implementationOptions;
                            } else {
                                const optionsKey = getOptionsKeyForOpportunity(key);
                                if (optionsKey) {
                                    fieldWithOptions.options = formOptions?.[optionsKey as keyof OpportunityFormOptions] || [];
                                }
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
                            type="submit"
                            disabled={form.processing}
                            onClick={() => {
                                handleSubmit();
                            }}
                            color={'firefly'}
                            className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {form.processing ? 'Submitting Opportunity...' : 'Submit Opportunity'}
                        </Button>
                    </div>
                </form>
            </div>
        </FrontendLayout>
    );
}
