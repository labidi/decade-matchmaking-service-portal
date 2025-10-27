import {useForm} from '@inertiajs/react';
import {useEffect, useState} from 'react';
import { offerFormFields } from '../config';
import {RequestOffer} from '../types/offer.types';

interface UseOfferFormProps {
    partners: Array<{ value: string; label: string }>;
    availableRequests: Array<{ value: string; label: string }>;
    offer: RequestOffer;
    isEditing?: boolean;
}


export function useOfferForm({partners, availableRequests, offer, isEditing = false}: UseOfferFormProps) {
    const form = useForm({
        id: '',
        request_id: '',
        partner_id: '',
        description: '',
        document: null,
        existing_documents: [] as any,
    });

    const [step, setStep] = useState(1);
    const steps = offerFormFields.map((s) => s.label);
    const [errorSteps, setErrorSteps] = useState<number[]>([]);

    const handleNext = () => setStep(prev => Math.min(prev + 1, steps.length));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = () => {
        form.clearErrors();
        setErrorSteps([]);

        const submitUrl = isEditing
            ? route('admin.offer.update', { id: offer.id })
            : route('admin.offer.store');
        const submitMethod = isEditing ? 'put' : 'post';

        form[submitMethod](submitUrl, {
            onSuccess: () => {
                // Handle successful submission
            },
            onError: (errors) => {
                const stepsWithError: number[] = [];
                Object.keys(errors).forEach(field => {
                    const idx = offerFormFields.findIndex(step => step.fields[field]);
                    if (idx !== -1 && !stepsWithError.includes(idx + 1)) {
                        stepsWithError.push(idx + 1);
                    }
                });
                setErrorSteps(stepsWithError);
            },
            onFinish: () => {
                // Handle completion
            }
        });
    };

    type FormDataKeys = keyof typeof form.data;
    useEffect(() => {
        if (offer?.request?.id) {
            form.setData('request_id', offer.request.id.toString());
        }
        if(offer.id){
          form.setData('id', offer.id.toString());
          form.setData('partner_id', offer.matched_partner?.id?.toString() || '');
          form.setData('description', offer.description || '');

          // Set existing documents for display in file input
          if (offer?.documents && Array.isArray(offer.documents) && offer.documents.length > 0) {
            form.setData('existing_documents', offer.documents);
          }
        }
    }, [offer]);

    const handleFieldChange = (name: string, value: any) => {
        form.setData(name as FormDataKeys, value);
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
