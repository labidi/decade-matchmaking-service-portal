import React, {useState, useEffect} from 'react';
import {Dialog} from 'primereact/dialog';
import axios from 'axios';
import FieldRenderer from '@/components/ui/forms/field-renderer';
import {UIOfferForm, Offer} from '@/Forms/UIOfferForm';
import XHRAlertDialog from '@/Components/Dialogs/XHRAlertDialog';
import { useForm } from '@inertiajs/react';

interface NewOfferDialogProps {
    visible: boolean;
    onHide: () => void;
    requestId: string;
    onSuccess: () => void;
    partners: { value: string, label: string }[];
    partnersError?: string | null;
    partnersLoading?: boolean;
}

export default function NewOfferDialog({visible, onHide, requestId, onSuccess, partners, partnersError, partnersLoading}: NewOfferDialogProps) {
    // XHR Dialog states
    const [xhrDialogOpen, setXhrDialogOpen] = useState(false);
    const [xhrDialogResponseMessage, setXhrDialogResponseMessage] = useState('');
    const [xhrDialogResponseType, setXhrDialogResponseType] = useState<'success' | 'error' | 'info' | 'redirect' | 'loading'>('info');

    // Inertia useForm for form state and errors
    const {
        data,
        setData,
        post,
        processing,
        errors: inertiaErrors,
        reset,
        setError,
    } = useForm<Record<string, any>>({
        description: '',
        partner_id: '',
        document: null,
    });
    const errors: Record<string, string> = inertiaErrors as Record<string, string>;

    // Prepare offer form fields with partner options injected
    const offerFormFields = React.useMemo(() => {
        const step = {...UIOfferForm[0]};
        step.fields = {...step.fields};
        if (step.fields.partner_id) {
            step.fields.partner_id = {
                ...step.fields.partner_id,
                options: partners.map(option => ({
                    value: option.value,
                    label: option.label,
                })),
            };
        }
        return step.fields;
    }, [partners]);

    const handleFieldChange = (name: string, value: any) => {
        setData(name, value);
    };

    const handleSubmitNewOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        setXhrDialogResponseType('loading');
        setXhrDialogResponseMessage('Submitting offer...');
        setXhrDialogOpen(true);

        const submitData = new FormData();
        submitData.append('description', data.description);
        submitData.append('partner_id', data.partner_id);
        if (data.document) {
            submitData.append('document', data.document);
        }

        try {
            const response = await axios.post(route('request.offer.store', {request: requestId}), submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setXhrDialogResponseType('success');
                setXhrDialogResponseMessage(response.data.message || 'Offer submitted successfully!');
                reset();
                onHide();
                onSuccess();
            } else {
                setXhrDialogResponseType('error');
                setXhrDialogResponseMessage(response.data.message || 'Failed to submit offer');
            }
        } catch (error: any) {
            setXhrDialogResponseType('error');
            if (error.response?.status === 422) {
                // Validation errors
                const validationErrors = error.response.data.errors || {};
                Object.entries(validationErrors).forEach(([field, message]) => {
                    setError(field, Array.isArray(message) ? message[0] : message);
                });
                setXhrDialogResponseMessage('Please correct the highlighted errors.');
            } else {
                setXhrDialogResponseMessage(error.response?.data?.message || 'Something went wrong');
            }
        }
    };

    return (
        <>
            <Dialog
                header="Submit New Offer"
                visible={visible}
                onHide={onHide}
                style={{width: '50vw'}}
                modal
            >
                <form className="mx-auto bg-white" onSubmit={handleSubmitNewOffer}>
                    {Object.entries(offerFormFields).map(([key, field]: [string, any]) => (
                        <FieldRenderer
                            key={key}
                            name={key}
                            field={field}
                            value={data[key]}
                            error={errors[key]}
                            onChange={handleFieldChange}
                            formData={data}
                        />
                    ))}
                    {partnersError && <div className="text-red-600 text-xs mt-1">{partnersError}</div>}

                    <div className="flex flex-col space-y-2 mt-6">
                        <button
                            type="submit"
                            className="px-4 py-1 bg-firefly-600 text-white rounded disabled:opacity-50"
                            disabled={processing || !data.document || !data.partner_id}
                        >
                            {processing ? 'Submitting...' : 'Submit Offer'}
                        </button>
                    </div>
                </form>
            </Dialog>

            {/* XHR Alert Dialog */}
            <XHRAlertDialog
                open={xhrDialogOpen}
                onOpenChange={setXhrDialogOpen}
                message={xhrDialogResponseMessage}
                type={xhrDialogResponseType}
                onConfirm={() => {
                    setXhrDialogOpen(false);
                    // Reload offers after successful submission
                    if (xhrDialogResponseType === 'success') {
                        onSuccess();
                    }
                }}
            />
        </>
    );
}
