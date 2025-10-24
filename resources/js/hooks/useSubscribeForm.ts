import { useState } from 'react';
import { UISubscribeForm } from '@/components/forms/UISubscribeForm';
import axios from 'axios';

interface UseSubscribeFormProps {
    onSuccess?: () => void;
}

interface FormData {
    user_id: number | null;
    request_id: number | null;
}

interface FormErrors {
    user_id?: string;
    request_id?: string;
    general?: string;
}

export function useSubscribeForm({ onSuccess }: UseSubscribeFormProps = {}) {
    const [data, setData] = useState<FormData>({
        user_id: null,
        request_id: null,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [processing, setProcessing] = useState(false);
    const [errorSteps, setErrorSteps] = useState<number[]>([]);
    const steps = UISubscribeForm.map((s) => s.label);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Clear previous errors
        setErrors({});
        setErrorSteps([]);
        setProcessing(true);

        try {
            // Use axios which handles CSRF tokens automatically
            const response = await axios.post(route('admin.subscriptions.subscribe-user'), data);

            if (response.data.success) {
                // Reset form
                setData({
                    user_id: null,
                    request_id: null,
                });
                setErrors({});

                // Call success callback
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                // Handle errors
                const newErrors: FormErrors = {};
                if (response.data.message) {
                    newErrors.general = response.data.message;
                }
                setErrors(newErrors);
            }
        } catch (error: any) {
            // Handle validation errors
            if (error.response?.data?.errors) {
                const newErrors: FormErrors = {};
                const serverErrors = error.response.data.errors;
                if (serverErrors.user_id) newErrors.user_id = serverErrors.user_id[0];
                if (serverErrors.request_id) newErrors.request_id = serverErrors.request_id[0];
                setErrors(newErrors);
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else {
                setErrors({ general: 'An error occurred while subscribing.' });
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleFieldChange = (name: string, value: any) => {
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error for this field when user changes it
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const getCurrentStepFields = () => {
        return UISubscribeForm[0].fields;
    };

    const reset = () => {
        setData({
            user_id: null,
            request_id: null,
        });
        setErrors({});
        setErrorSteps([]);
    };

    return {
        form: {
            data,
            errors,
            processing,
            setData,
            setError: setErrors,
            clearErrors: () => setErrors({}),
            reset,
        },
        steps,
        errorSteps,
        handleSubmit,
        handleFieldChange,
        getCurrentStepFields,
    };
}
