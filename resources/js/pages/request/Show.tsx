import { FrontendLayout } from '@layouts/index';
import React from 'react';
import { Head } from '@inertiajs/react';
import { Heading } from '@ui/primitives/heading';
import { OCDRequest, PageProps } from '@/types';
import { RequestShowActionButtons } from '@features/requests';
import {
    StatusBanner,
    StatusInfoCard,
    RequestDetailsCard,
    OfferDetailsCard,
} from '@features/requests/components/show';

interface ShowRequestProps
    extends PageProps<{
        request: OCDRequest;
        current_route_name: string;
    }> {}

export default function ShowRequest({ auth, request, current_route_name }: Readonly<ShowRequestProps>) {
    return (
        <FrontendLayout>
            <Head title={`Request: ${request.detail.capacity_development_title || request.id}`} />

            {/* Page Title */}
            <Heading className="text-2xl/7 font-bold text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight mb-6">
                Request Details
            </Heading>

            {/* Status Banner */}
            <div className="mb-6">
                <StatusBanner request={request} />
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Column (2/3 width on large screens) */}
                <div className="lg:col-span-2 space-y-6">
                    <RequestDetailsCard request={request} />

                    {/* Display offer details if there's an active offer */}
                    {request.active_offer && (
                        <OfferDetailsCard offer={request.active_offer} request={request} />
                    )}
                </div>

                {/* Sidebar - Right Column (1/3 width on large screens) */}
                <div className="space-y-6">
                    <StatusInfoCard request={request} />

                    {/* Action Buttons in Sidebar */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Actions
                        </h3>
                        <RequestShowActionButtons request={request} auth={auth} />
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}
