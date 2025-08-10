import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { RequestOffer, Auth, Document } from '@/types';
import { Button } from '@/components/ui/button';
import { Field, Label } from '@/components/ui/fieldset';
import { Badge } from '@/components/ui/badge';
import { DocumentArrowUpIcon, TrashIcon } from '@heroicons/react/16/solid';
import axios from 'axios';

interface OfferDetailsSectionProps {
    activeOffer: RequestOffer;
}

export default function OfferDetailsSection({ activeOffer }: Readonly<OfferDetailsSectionProps>) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [documents, setDocuments] = useState<Document[]>(activeOffer.documents || []);
    
    const form = useForm<{ 
        file: File | null; 
        document_type: string 
    }>({
        file: null,
        document_type: 'offer_document',
    });

    const handleDocumentUpload = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.data.file) return;
        
        form.post(route('user.offer.document.store', { offer: activeOffer.id }), {
            forceFormData: true,
            onSuccess: (response) => {
                form.reset();
                // Refresh the page to get updated documents
                window.location.reload();
            },
            onError: (errors) => {
                console.error('Upload failed:', errors);
            }
        });
    };

    const handleDeleteDocument = async (documentId: number) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        
        try {
            await axios.delete(route('user.document.destroy', documentId));
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        } catch (error) {
            console.error('Failed to delete document:', error);
        }
    };

    const getStatusBadgeColor = (statusLabel: string) => {
        switch (statusLabel.toLowerCase()) {
            case 'active':
                return 'green';
            case 'inactive':
                return 'red';
            default:
                return 'zinc';
        }
    };

    return (
        <section id="offer-details" className="my-8">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Partner Offer
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Offer details from your matched partner
                    </p>
                </div>

                {/* Offer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Offer Details
                        </h3>
                        
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Status
                                </dt>
                                <dd className="mt-1">
                                    <Badge color={getStatusBadgeColor(activeOffer.status_label)}>
                                        {activeOffer.status_label}
                                    </Badge>
                                </dd>
                            </div>
                            
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Description
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                    {activeOffer.description}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Partner Information
                        </h3>
                        
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Partner Name
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {activeOffer.matched_partner?.name || 'Unknown Partner'}
                                </dd>
                            </div>
                            
                            {activeOffer.matched_partner?.email && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Email
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {activeOffer.matched_partner.email}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>

                {/* Documents Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Documents
                    </h3>

                    {/* Document Upload Form */}
                    <form onSubmit={handleDocumentUpload} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-end space-x-4">
                            <div className="flex-1">
                                <Field>
                                    <Label>Upload Document</Label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                        onChange={e => form.setData('file', e.currentTarget.files ? e.currentTarget.files[0] : null)}
                                    />
                                </Field>
                                {form.errors.file && (
                                    <p className="mt-1 text-sm text-red-600">{form.errors.file}</p>
                                )}
                            </div>
                            
                            <Button 
                                type="submit" 
                                disabled={form.processing || !form.data.file}
                                className="shrink-0"
                            >
                                <DocumentArrowUpIcon data-slot="icon" />
                                {form.processing ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>
                    </form>

                    {/* Documents List */}
                    {documents.length > 0 ? (
                        <div className="space-y-3">
                            {documents.map((document) => (
                                <div
                                    key={document.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {document.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Uploaded {new Date(document.created_at).toLocaleDateString()}
                                        </p>
                                        {document.document_type && (
                                            <Badge color="blue" className="mt-1">
                                                {document.document_type.replace(/_/g, ' ').toUpperCase()}
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            outline
                                            href={route('user.document.download', document.id)}
                                            target="_blank"
                                        >
                                            Download
                                        </Button>
                                        
                                        {document.uploader_id === auth.user.id && (
                                            <Button
                                                outline
                                                onClick={() => handleDeleteDocument(document.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <TrashIcon data-slot="icon" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>No documents uploaded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}