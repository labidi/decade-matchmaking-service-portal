import {useForm} from '@inertiajs/react';
import {useEffect, useState} from 'react';
import {UIOpportunityForm} from '@/Forms/UIOpportunityForm';
import {Opportunity, FormOptions} from '@/types';

export function useOpportunityForm(opportunity?: Opportunity, formOptions?: FormOptions) {
    const form = useForm({
        id: opportunity?.id || '',
        title: opportunity?.title || '',
        type: opportunity?.type || '',
        closing_date: opportunity?.closing_date || '',
        coverage_activity: opportunity?.coverage_activity || '',
        implementation_location: opportunity?.implementation_location || '',
        target_audience: opportunity?.target_audience || '',
        target_audience_other: opportunity?.target_audience_other || '',
        summary: opportunity?.summary || '',
        url: opportunity?.url || '',
        key_words: opportunity?.keywords ? opportunity.keywords.split(',') : [],
    });

    const [currentStep, setCurrentStep] = useState(0);
    const steps = UIOpportunityForm.map((s) => s.label);
    const [errorSteps, setErrorSteps] = useState<number[]>([]);
    const [implementationOptions, setImplementationOptions] = useState<{ value: string; label: string }[]>([]);

    // Handle implementation location options based on coverage activity
    useEffect(() => {
        if (!formOptions) return;

        switch (form.data.coverage_activity) {
            case 'country':
                setImplementationOptions(formOptions.countries || []);
                break;
            case 'Regions':
                setImplementationOptions(formOptions.regions || []);
                break;
            case 'Ocean-based':
                setImplementationOptions(formOptions.oceans || []);
                break;
            case 'Global':
                setImplementationOptions([{value: 'Global', label: 'Global'}]);
                break;
            default:
                setImplementationOptions([]);
        }
        // Clear implementation location when coverage activity changes
        form.setData('implementation_location', '');
    }, [form.data.coverage_activity, formOptions]);

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        form.clearErrors();
        setErrorSteps([]);

        form.post(route('opportunity.store'), {
            preserveScroll: true,
            onSuccess: () => {
                // Handle success - could redirect or show success message
            },
            onError: (errors) => {
                const stepsWithError: number[] = [];
                Object.keys(errors).forEach(field => {
                    const idx = UIOpportunityForm.findIndex(step => step.fields[field]);
                    if (idx !== -1 && !stepsWithError.includes(idx)) {
                        stepsWithError.push(idx);
                    }
                });
                setErrorSteps(stepsWithError);

                // Jump to first step with error
                if (stepsWithError.length > 0) {
                    setCurrentStep(stepsWithError[0]);
                }
            },
        });
    };

    const handleFieldChange = (name: string, value: any) => {
        form.setData(name as keyof typeof form.data, value);
    };

    // Get form options for specific fields
    const getFieldOptions = (fieldName: string) => {
        if (!formOptions) return [];

        switch (fieldName) {
            case 'implementation_location':
                return implementationOptions;
            case 'type':
            case 'opportunity_types':
                return formOptions.opportunity_types || [];
            case 'target_audience':
                return formOptions.target_audience || [];
            default:
                return [];
        }
    };

    return {
        form,
        currentStep,
        steps,
        errorSteps,
        implementationOptions,
        handleNext,
        handleBack,
        handleSubmit,
        handleFieldChange,
        setCurrentStep,
        getFieldOptions,
    };
}
