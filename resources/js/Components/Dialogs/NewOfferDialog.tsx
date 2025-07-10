import React, {useState, useEffect} from 'react';
import {Dialog} from 'primereact/dialog';
import axios from 'axios';
import FieldRenderer from '@/Components/Forms/FieldRenderer';
import {UIOfferForm, Offer} from '@/Forms/UIOfferForm';
import XHRAlertDialog from '@/Components/Dialogs/XHRAlertDialog';

interface NewOfferDialogProps {
    visible: boolean;
    onHide: () => void;
    requestId: string;
    onSuccess: () => void;
}

export default function NewOfferDialog({visible, onHide, requestId, onSuccess}: NewOfferDialogProps) {
    // XHR Dialog states
    const [xhrDialogOpen, setXhrDialogOpen] = useState(false);
    const [xhrDialogResponseMessage, setXhrDialogResponseMessage] = useState('');
    const [xhrDialogResponseType, setXhrDialogResponseType] = useState<'success' | 'error' | 'info' | 'redirect' | 'loading'>('info');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form data state
    const [formData, setFormData] = useState<Offer>({
        description: '',
        partner_id: '',
        document: null,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Partner users state
    const [partners, setPartners] = useState<{id: string, name: string, email: string, first_name?: string, last_name?: string}[]>([]);
    const [partnersLoading, setPartnersLoading] = useState(false);
    const [partnersError, setPartnersError] = useState<string | null>(null);

    useEffect(() => {
        setPartnersLoading(true);
        axios.get(route('api.partners.list'))
            .then(res => {
                if (res.data.success) {
                    setPartners(res.data.data);
                } else {
                    setPartnersError('Failed to load partners');
                }
            })
            .catch(() => setPartnersError('Failed to load partners'))
            .finally(() => setPartnersLoading(false));
    }, []);

    // Prepare offer form fields with partner options injected
    const offerFormFields = React.useMemo(() => {
        const step = {...UIOfferForm[0]};
        step.fields = {...step.fields};
        if (step.fields.partner_id) {
            step.fields.partner_id = {
                ...step.fields.partner_id,
                options: partners.map(partner => ({
                    value: partner.id,
                    label: `${partner.name || ((partner.first_name || '') + ' ' + (partner.last_name || ''))} (${partner.email})`,
                })),
            };
        }
        return step.fields;
    }, [partners]);

    const handleFieldChange = (name: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmitNewOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setXhrDialogResponseType('loading');
        setXhrDialogResponseMessage('Submitting offer...');
        setXhrDialogOpen(true);

        try {
            // Create FormData for file upload
            const submitData = new FormData();
            submitData.append('description', formData.description);
            submitData.append('partner_id', formData.partner_id);
            if (formData.document) {
                submitData.append('document', formData.document);
            }

            const response = await axios.post(route('request.offer.store', { request: requestId }), submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setXhrDialogResponseType('success');
                setXhrDialogResponseMessage(response.data.message || 'Offer submitted successfully!');
                
                // Reset form
                setFormData({
                    description: '',
                    partner_id: '',
                    document: null,
                });
                setFormErrors({});
                onHide();
                
                // Call success callback
                onSuccess();
            } else {
                setXhrDialogResponseType('error');
                setXhrDialogResponseMessage(response.data.message || 'Failed to submit offer');
            }
        } catch (error: any) {
            setXhrDialogResponseType('error');
            if (error.response?.status === 422) {
                // Validation errors
                const validationErrors = error.response.data.errors;
                setFormErrors(validationErrors);
                setXhrDialogResponseMessage('Please correct the highlighted errors.');
            } else {
                setXhrDialogResponseMessage(error.response?.data?.message || 'Something went wrong');
            }
        } finally {
            setIsSubmitting(false);
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
                    {Object.entries(offerFormFields).map(([key, field]) => (
                        <FieldRenderer
                            key={key}
                            name={key}
                            field={field}
                            value={formData[key as keyof Offer]}
                            error={formErrors[key]}
                            onChange={handleFieldChange}
                            formData={formData}
                        />
                    ))}
                    {partnersError && <div className="text-red-600 text-xs mt-1">{partnersError}</div>}

                    <div className="flex flex-col space-y-2 mt-6">
                        <button
                            type="submit"
                            className="px-4 py-1 bg-firefly-600 text-white rounded disabled:opacity-50"
                            disabled={isSubmitting || !formData.document || !formData.partner_id}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Offer'}
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