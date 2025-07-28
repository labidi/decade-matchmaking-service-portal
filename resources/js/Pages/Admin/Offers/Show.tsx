import React from 'react';
import {Head, router} from '@inertiajs/react';
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout';
import {RequestOffer} from '@/types';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {PencilIcon, TrashIcon, EyeIcon} from '@heroicons/react/16/solid';
import {formatDate} from '@/utils/date-formatter';

interface ShowOfferPageProps {
    offer: RequestOffer;
}

export default function ShowOffer({offer}: Readonly<ShowOfferPageProps>) {

    const handleDeleteOffer = () => {
        if (confirm(`Are you sure you want to delete this offer? This action cannot be undone.`)) {
            router.delete(route('admin.offers.destroy', {id: offer.id}), {
                onSuccess: () => {
                    router.visit(route('admin.offers.list'));
                },
                onError: (errors) => {
                    console.error('Failed to delete offer:', errors);
                }
            });
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

                    <div className="flex items-center gap-3">
                        {/* View Request Button */}
                        {offer.request && (
                            <Button
                                outline
                                href={route('request.show', {id: offer.request_id})}
                            >
                                <EyeIcon data-slot="icon" />
                                View Request
                            </Button>
                        )}

                        {/* Edit Button */}
                        {offer.can_edit && (
                            <Button
                                outline
                                href={route('admin.offers.edit', {id: offer.id})}
                            >
                                <PencilIcon data-slot="icon" />
                                Edit
                            </Button>
                        )}

                        {/* Delete Button */}
                        {offer.can_delete && (
                            <Button
                                onClick={handleDeleteOffer}
                                outline
                            >
                                <TrashIcon data-slot="icon" />
                                Delete
                            </Button>
                        )}
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
                                    <Badge color={getStatusBadgeColor(offer.status_label)}>
                                        {offer.status_label}
                                    </Badge>
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
                            {offer.documents.map((document) => (
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
