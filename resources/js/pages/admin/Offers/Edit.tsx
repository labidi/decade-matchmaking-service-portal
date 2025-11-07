import React from 'react';
import {Head} from '@inertiajs/react';
import {SidebarLayout} from '@layouts/index';
import {RequestOffer, User, Document} from '@/types';
import {FormProvider} from '@ui/organisms/forms';
import {offerFormFields} from '@features/offers/config';
import {Heading} from "@ui/primitives/heading";

interface EditOfferPageProps {
    offer: RequestOffer;
    partners: User[];
}

export default function EditOffer({
                                      offer,
                                      partners
                                  }: Readonly<EditOfferPageProps>) {

    // Prepare the form configuration for editing (remove partner selection)
    const editOfferForm = offerFormFields.map(step => ({
        ...step,
        fields: Object.fromEntries(
            Object.entries(step.fields).filter(([key]) => key !== 'partner_id')
        )
    }));

    return (
        <SidebarLayout>
            <Head title={`Edit Offer #${offer.id}`}/>

            <div className="space-y-6">
                {/* Header */}
                <div className="mx-auto">
                    <Heading level={1}>
                        Notification Details
                    </Heading>
                    <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
                </div>

                {/* Offer Context */}
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-xl font-medium">
                                Request:
                            </h3>
                            <p className="mt-1 text-xl ">
                                {offer.request?.detail.capacity_development_title || 'Unknown Request'}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-medium ">
                                Partner:
                            </h3>
                            <p className="mt-1 text-xl">
                                {offer.matched_partner?.name || 'Unknown Partner'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div>
                    <FormProvider
                        steps={editOfferForm}
                        initialData={{
                            description: offer.description,
                            document: null
                        }}
                        submitUrl={route('admin.offers.update', {id: offer.id})}
                        method="PUT"
                        backUrl={route('admin.offers.show', {id: offer.id})}
                        backLabel="Back to Offer"
                        submitLabel="Update Offer"
                    />
                </div>

                {/* Current Documents */}
                {offer.documents && offer.documents.length > 0 && (
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Current Documents
                        </h2>

                        <div className="space-y-3">
                            {offer.documents.map((document: Document) => (
                                <div
                                    key={document.id}
                                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {document.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Uploaded {new Date(document.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <a
                                        href={document.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>

                        <p className="mt-3 text-xs text-gray-500">
                            Note: Uploading a new document will replace the existing ones.
                        </p>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}
