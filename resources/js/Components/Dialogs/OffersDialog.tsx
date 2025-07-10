import React, {useState} from 'react';
import {Dialog} from 'primereact/dialog';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import {Tag} from 'primereact/tag';
import axios from 'axios';
import NewOfferDialog from '@/Components/Dialogs/NewOfferDialog';

interface RequestOffer {
    id: string;
    description: string;
    partner_id: string;
    document_url?: string;
    created_at: string;
    status: number;
    status_label: string;
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
            case 1:
                severity = 'success';
                icon = 'pi pi-check-circle';
                break;
            case 2:
                severity = 'danger';
                icon = 'pi pi-times-circle';
                break;
            default:
                severity = 'info';
                icon = 'pi pi-info-circle';
        }

        return (
            <Tag
                value={rowData.status_label}
                severity={severity}
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
        <>
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
                                field="status_label"
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
                </div>
            </Dialog>

            {/* New Offer Dialog */}
            <NewOfferDialog
                visible={showNewOfferForm}
                onHide={() => setShowNewOfferForm(false)}
                requestId={requestId}
                onSuccess={loadOffers}
            />
        </>
    );
}
