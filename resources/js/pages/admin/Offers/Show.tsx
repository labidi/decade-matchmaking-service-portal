import React from 'react';
import {Head, router} from '@inertiajs/react';
import {SidebarLayout} from '@layouts/index';
import {RequestOffer, Document} from '@/types';
import {Button} from '@ui/primitives/button';
import {Badge} from '@ui/primitives/badge';
import {PencilIcon, TrashIcon, EyeIcon} from '@heroicons/react/16/solid';
import {formatDate, offerStatusBadgeRenderer} from '@shared/utils';
import {OfferActionButtons} from '@features/offers/components/offer-action-buttons';

interface ShowOfferPageProps {
    offer: RequestOffer;
}


export default function ShowOffer({offer}: Readonly<ShowOfferPageProps>) {

    return (
        <SidebarLayout>
            <Head title={`Offer #${offer.id}`}/>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Offer #{offer.id}
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Created {formatDate(offer.created_at)}
                        </p>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex-shrink-0">
                        <OfferActionButtons offer={offer} layout="horizontal" />
                    </div>
                </div>

                {/* Offer Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Main Offer Information */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Offer Information
                        </h2>

                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Status
                                </dt>
                                <dd className="mt-1">
                                    {offerStatusBadgeRenderer(offer)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Partner
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {offer.matched_partner?.name || 'Unknown Partner'}
                                </dd>
                                {offer.matched_partner?.email && (
                                    <dd className="text-xs text-gray-500">
                                        {offer.matched_partner.email}
                                    </dd>
                                )}
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Description
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                    {offer.description}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Related Request Information */}
                    {offer.request && (
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Related Request
                            </h2>

                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Request ID
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                        #{offer.request.id}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Title
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {offer.request.detail.capacity_development_title}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Requested by
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {offer.request.user.name}
                                    </dd>
                                    {offer.request.user.email && (
                                        <dd className="text-xs text-gray-500">
                                            {offer.request.user.email}
                                        </dd>
                                    )}
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Request Status
                                    </dt>
                                    <dd className="mt-1">
                                        <Badge color="blue">
                                            {offer.request.status.status_label}
                                        </Badge>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    )}
                </div>

                {/* Documents */}
                {offer.documents && offer.documents.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Documents
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
                                            Uploaded {formatDate(document.created_at)}
                                        </p>
                                    </div>
                                    <Button
                                        outline
                                        href={document.path}
                                        target="_blank"
                                    >
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}
