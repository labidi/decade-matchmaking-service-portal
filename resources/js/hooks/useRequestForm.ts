import {useForm} from '@inertiajs/react';
import {useState} from 'react';
import {UIRequestForm} from '@/Forms/UIRequestForm';
import {useDialog} from '@/Components/Dialogs';
import {OCDRequest} from '@/types';

type Mode = 'submit' | 'draft';

interface FormOptions {
    subthemes?: Array<{ value: string; label: string }>;
    supportTypes?: Array<{ value: string; label: string }>;
    relatedActivities?: Array<{ value: string; label: string }>;
    deliveryFormats?: Array<{ value: string; label: string }>;
    targetAudiences?: Array<{ value: string; label: string }>;
    deliveryCountries?: Array<{ value: string; label: string }>;
}

export function useRequestForm(request: OCDRequest, formOptions?: FormOptions) {
    console.log('useRequestForm initialized with request:', request);
    const {showDialog, closeDialog} = useDialog();

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
        form.post(route('request.submit'), {
            preserveScroll: true,
            onBefore: () => {
                showDialog('proccessing', 'loading');
            },
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
                closeDialog()
            }
        });
    };

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
