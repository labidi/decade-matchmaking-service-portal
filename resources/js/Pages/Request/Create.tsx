import FrontendLayout from '@/Layouts/FrontendLayout';
import React, {useEffect, useState} from 'react';
import XHRAlertDialog from '@/Components/Dialogs/XHRAlertDialog';

import {Head, router, useForm, usePage} from '@inertiajs/react';
import {OCDRequest} from '@/types';
import {UIRequestForm} from '@/Forms/UIRequestForm';
import {submitRequest} from '@/Services/Api/request';
import FieldRenderer from '@/Components/Forms/FieldRenderer';


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

    const handleFieldChange = (name: string, value: any) => {
        form.setData(name as FormDataKeys, value);
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
                {Object.entries(UIRequestForm[step - 1].fields).map(([key, field]) => (
                    <FieldRenderer
                        key={key}
                        name={key}
                        field={field}
                        value={(form.data as any)[key as FormDataKeys]}
                        error={form.errors[key as FormDataKeys]}
                        onChange={handleFieldChange}
                        formData={form.data}
                    />
                ))}

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
