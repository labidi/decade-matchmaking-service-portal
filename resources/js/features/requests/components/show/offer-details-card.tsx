import React from 'react';
import { usePage } from '@inertiajs/react';
import { RequestOffer, Auth } from '@/types';
import { OCDRequest } from '@features/requests/types/request.types';
import { Heading } from '@ui/primitives/heading';
import { Divider } from '@ui/primitives/divider';
import { offerStatusBadgeRenderer } from '@shared/utils';
import { useDocumentManagement } from '@features/requests/hooks/use-document-management';
import { DocumentUploadForm } from './components/document-upload-form';
import { DocumentList } from './components/document-list';
import { OfferInfoSection } from './components/offer-info-section';
import { OfferActionButtons } from '@features/offers/components/offer-action-buttons';

interface OfferDetailsCardProps {
    request: OCDRequest;
    offer: RequestOffer;
}

export function OfferDetailsCard({ offer, request }: OfferDetailsCardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { uploadForm, handleUpload, handleDelete, isDeleting, uploadError } = useDocumentManagement({
        offerId: offer.id,
    });

    // Use status_code instead of status_label for logic
    const canUploadDocuments = request.status.status_code === 'in_implementation';
    const documents = offer.documents || [];

    return (
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            {/* Header with prominent badge */}
            <div className="px-6 py-4 border-b border-blue-200 dark:border-blue-800 bg-blue-100 dark:bg-blue-900/20">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <Heading level={3} className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Active Offer
                    </Heading>
                    {offerStatusBadgeRenderer(offer)}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Partner Information & Offer Details */}
                <OfferInfoSection offer={offer} />

                {/* Offer Actions */}
                {offer.actions && offer.actions.length > 0 && (
                    <>
                        <Divider />
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Offer Actions</h4>
                            <OfferActionButtons offer={offer} layout="horizontal" />
                        </div>
                    </>
                )}

                <Divider />

                {/* Documents Section */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Documents</h4>

                    {/* Display upload error if exists */}
                    {uploadError && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                        </div>
                    )}

                    {/* Upload Form */}
                    <DocumentUploadForm form={uploadForm} onSubmit={handleUpload} isVisible={canUploadDocuments} />

                    {/* Document List */}
                    <DocumentList
                        documents={documents}
                        currentUserId={auth.user.id}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                    />
                </div>
            </div>
        </div>
    );
}
