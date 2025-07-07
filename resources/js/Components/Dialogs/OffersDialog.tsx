import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Tag } from 'primereact/tag';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

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

export default function OffersDialog({ visible, onHide, requestId, requestTitle }: OffersDialogProps) {
    const [offers, setOffers] = useState<RequestOffer[]>([]);
    const [showNewOfferForm, setShowNewOfferForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
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
            const response = await axios.get(route('admin.request.offers', requestId));
            setOffers(response.data.offers || []);
        } catch (error) {
            console.error('Error loading offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitOffer = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('description', data.description);
        formData.append('partner_id', data.partner_id);
        if (selectedFile) {
            formData.append('document', selectedFile);
        }

        try {
            await axios.post(route('admin.request.offer.store', requestId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            reset();
            setSelectedFile(null);
            setShowNewOfferForm(false);
            loadOffers();
        } catch (error) {
            console.error('Error submitting offer:', error);
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
            style={{ width: '80vw', maxWidth: '1200px' }}
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
                    style={{ width: '50vw' }}
                    modal
                >
                    <form onSubmit={handleSubmitOffer} className="space-y-4">
                        <div>
                            <label htmlFor="partner_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Partner ID *
                            </label>
                            <InputText
                                id="partner_id"
                                value={data.partner_id}
                                onChange={(e) => setData('partner_id', e.target.value)}
                                className={`w-full ${errors.partner_id ? 'p-invalid' : ''}`}
                                placeholder="Enter partner ID"
                            />
                            {errors.partner_id && (
                                <small className="p-error">{errors.partner_id}</small>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <InputTextarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className={`w-full ${errors.description ? 'p-invalid' : ''}`}
                                rows={4}
                                placeholder="Enter offer description"
                            />
                            {errors.description && (
                                <small className="p-error">{errors.description}</small>
                            )}
                        </div>

                        <div>
                            <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                                Offer Document (PDF)
                            </label>
                            <FileUpload
                                mode="basic"
                                accept=".pdf"
                                maxFileSize={10000000}
                                chooseLabel="Choose PDF"
                                onSelect={(e) => setSelectedFile(e.files[0])}
                                customUpload
                                uploadHandler={() => {}}
                                auto
                                className="w-full"
                            />
                            {selectedFile && (
                                <div className="mt-2 text-sm text-gray-600">
                                    Selected: {selectedFile.name}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                label="Cancel"
                                icon="pi pi-times"
                                onClick={() => setShowNewOfferForm(false)}
                                className="p-button-text"
                            />
                            <Button
                                type="submit"
                                label="Submit Offer"
                                icon="pi pi-check"
                                loading={processing}
                                disabled={!data.partner_id || !data.description}
                            />
                        </div>
                    </form>
                </Dialog>
            </div>
        </Dialog>
    );
}
