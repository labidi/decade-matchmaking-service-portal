import React, {useState} from 'react';
import {Dialog} from 'primereact/dialog';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import {Tag} from 'primereact/tag';
import {useForm} from '@inertiajs/react';
import axios from 'axios';
import FieldRenderer from '@/Components/Forms/FieldRenderer';
import {UIOfferForm, Offer} from '@/Forms/UIOfferForm';

interface RequestOffer {
    id: string;
    description: string;
    partner_id: string;
    document_url?: string;
    created_at: string;
    status: string;
}

interface OffersDialogProps {
    visible: boolean;
    onHide: () => void;
    requestId: string;
    requestTitle: string;
}

export default function OffersDialog({visible, onHide, requestId, requestTitle}: OffersDialogProps) {
    const [offers, setOffers] = useState<RequestOffer[]>([]);
    const [showNewOfferForm, setShowNewOfferForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const {data, setData, post, processing, errors, reset} = useForm({
        description: '',
        partner_id: '',
        document: null as File | null,
    });

    // Load offers when dialog opens
    React.useEffect(() => {
        if (visible && requestId) {
            loadOffers();
        }
    }, [visible, requestId]);

    const loadOffers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('request.offer.list', requestId));
            if (response.data.success) {
                setOffers(response.data.data.offers || []);
            } else {
                console.error('Error loading offers:', response.data.message);
            }
        } catch (error: any) {
            console.error('Error loading offers:', error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const form = useForm<Offer>({
        description: '',
        partner_id: '',
        file: null,
    });

    const descriptionBodyTemplate = (rowData: RequestOffer) => (
        <div className="max-w-xs">
            <p className="text-sm text-gray-900 line-clamp-2">{rowData.description}</p>
        </div>
    );

    const dateBodyTemplate = (rowData: RequestOffer) => (
        <div className="text-sm text-gray-600">
            {new Date(rowData.created_at).toLocaleDateString()}
        </div>
    );

    const statusBodyTemplate = (rowData: RequestOffer) => {
        let severity: 'success' | 'info' | 'warning' | 'danger' | undefined = undefined;
        let icon = 'pi pi-info-circle';

        switch (rowData.status) {
            case 'pending':
                severity = 'warning';
                icon = 'pi pi-clock';
                break;
            case 'accepted':
                severity = 'success';
                icon = 'pi pi-check-circle';
                break;
            case 'rejected':
                severity = 'danger';
                icon = 'pi pi-times-circle';
                break;
            default:
                severity = 'info';
                icon = 'pi pi-info-circle';
        }

        return (
            <Tag
                value={rowData.status}
                severity={severity}
                icon={<i className={icon}/>}
                className="capitalize"
            />
        );
    };

    const actionsBodyTemplate = (rowData: RequestOffer) => (
        <div className="flex space-x-2">
            {rowData.document_url && (
                <Button
                    icon="pi pi-download"
                    size="small"
                    outlined
                    onClick={() => window.open(rowData.document_url, '_blank')}
                    tooltip="Download Document"
                />
            )}
        </div>
    );

    const footer = (
        <div className="flex justify-between items-center">
            <Button
                label="New Offer"
                icon="pi pi-plus"
                onClick={() => setShowNewOfferForm(true)}
                className="p-button-sm"
            />
            <Button
                label="Close"
                icon="pi pi-times"
                onClick={onHide}
                className="p-button-text p-button-sm"
            />
        </div>
    );



    return (
        <Dialog
            header={`Offers for Request: ${requestTitle}`}
            visible={visible}
            onHide={onHide}
            style={{width: '80vw', maxWidth: '1200px'}}
            footer={footer}
            maximizable
        >
            <div className="space-y-6">
                {/* Offers DataTable */}
                <div className="bg-white rounded-lg border">
                    <DataTable
                        value={offers}
                        loading={loading}
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        showGridlines
                        emptyMessage="No offers found for this request."
                        className="p-datatable-sm"
                    >
                        <Column
                            field="partner_id"
                            header="Partner ID"
                            sortable
                            style={{width: '120px'}}
                        />
                        <Column
                            field="description"
                            header="Description"
                            body={descriptionBodyTemplate}
                            style={{minWidth: '200px'}}
                        />
                        <Column
                            field="created_at"
                            header="Submitted Date"
                            body={dateBodyTemplate}
                            sortable
                            style={{width: '150px'}}
                        />
                        <Column
                            field="status"
                            header="Status"
                            body={statusBodyTemplate}
                            sortable
                            style={{width: '120px'}}
                        />
                        <Column
                            header="Actions"
                            body={actionsBodyTemplate}
                            style={{width: '100px'}}
                        />
                    </DataTable>
                </div>

                {/* New Offer Form Dialog */}
                <Dialog
                    header="Submit New Offer"
                    visible={showNewOfferForm}
                    onHide={() => setShowNewOfferForm(false)}
                    style={{width: '50vw'}}
                    modal
                >
                    <form className="mx-auto bg-white"
                          onSubmit={e => {
                              e.preventDefault();
                              form.post(route('request.offer.store', {request: requestId}), {
                                  forceFormData: true,
                                  onSuccess: (response: any) => {
                                      form.reset();
                                      setShowNewOfferForm(false);
                                      loadOffers();
                                      console.log('Offer submitted successfully:', response?.data?.message);
                                  },
                                  onError: (errors) => {
                                      console.error('Form submission errors:', errors);
                                  },
                              });
                          }}
                    >
                        {Object.entries(UIOfferForm[0].fields).map(([key, field]) => (
                            <FieldRenderer
                                key={key}
                                name={key}
                                field={field}
                                value={(form.data as any)[key]}
                                error={(form.errors as any)[key]}
                                onChange={(name, value) => (form.setData as any)(name, value)}
                                formData={form.data}
                            />
                        ))}

                        <div className="flex flex-col space-y-2 mt-6">
                            <button
                                type="submit"
                                className="px-4 py-1 bg-firefly-600 text-white rounded disabled:opacity-50"
                                disabled={form.processing || !form.data.file || !form.data.partner_id}
                            >
                                Submit Offer
                            </button>
                        </div>
                    </form>
                </Dialog>
            </div>
        </Dialog>
    );
}
