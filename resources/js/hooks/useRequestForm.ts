import {useForm} from '@inertiajs/react';
import {useEffect, useState} from 'react';
import {UIRequestForm} from '@/Forms/UIRequestForm';
import {OCDRequest} from '@/types';

type Mode = 'submit' | 'draft';


export function useRequestForm(request?: OCDRequest) {

    const form = useForm({
        id: '',
        is_related_decade_action: '',
        unique_related_decade_action_id: '',
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
        target_audience: [] as string[],
        target_audience_other: '',
        target_languages: [] as string[],
        target_languages_other: '',
        delivery_format: '',
        delivery_countries: [] as string[],
    });

    const [step, setStep] = useState(1);
    const steps = UIRequestForm.map((s) => s.label);
    const [errorSteps, setErrorSteps] = useState<number[]>([]);

    const handleNext = () => setStep(prev => Math.min(prev + 1, steps.length));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (mode: Mode) => {
        form.clearErrors();
        setErrorSteps([]);
        form.transform((data) => ({
            ...data,
            mode: mode,
        }));
        form.post(route('request.submit',{'id':request?.id}), {
            onSuccess: (page) => {
                if (mode === 'draft') {
                    let editId: string = '';
                } else {
                    // Optionally handle redirect for submit
                }
            },
            onError: (errors) => {
                const stepsWithError: number[] = [];
                Object.keys(errors).forEach(field => {
                    const idx = UIRequestForm.findIndex(step => step.fields[field]);
                    if (idx !== -1 && !stepsWithError.includes(idx + 1)) {
                        stepsWithError.push(idx + 1);
                    }
                });
                setErrorSteps(stepsWithError);
            },
            onFinish: () => {
            }
        });
    };

    type FormDataKeys = keyof typeof form.data;

    useEffect(() => {
        if (request?.id) {
            form.setData('id', request.id.toString());
            Object.entries(request.detail).forEach(([key, value]) => {
                if (key in form.data && key !== 'id') {
                    form.setData(key as FormDataKeys, value || '');
                }
            });
        }
    }, []);

    const handleFieldChange = (name: string, value: any) => {
        form.setData(name as keyof typeof form.data, value);
    };

    return {
        form,
        step,
        steps,
        errorSteps,
        handleNext,
        handleBack,
        handleSubmit,
        handleFieldChange,
        setStep,
    };
}
