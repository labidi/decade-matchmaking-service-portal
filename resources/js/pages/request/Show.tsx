import { FrontendLayout } from '@layouts/index';
import { OfferDetailsSection } from '@features/requests';
import React from 'react';
import { RequestDetails } from '@features/requests';
import {Head} from '@inertiajs/react';
import {Heading} from "@ui/primitives/heading";
import {OCDRequest, PageProps, RequestOffer} from '@/types';
import {RequestShowActionButtons} from '@features/requests';

interface ShowRequestProps extends PageProps<{
    request: OCDRequest;
    current_route_name: string;
}> {
}

export default function ShowRequest({
                                        auth,
                                        request,
                                        current_route_name
                                    }: Readonly<ShowRequestProps>) {

    return (
        <FrontendLayout>
            <Head title={`Request: ${request.id}`}/>
            <Heading className="text-2xl/7 font-bold text-gray-900 dark:text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
                Request Details
            </Heading>
            <RequestDetails request={request}/>
            {/* Display offer details if there's an active offer */}
            {request.active_offer && (
                <OfferDetailsSection offer={request.active_offer} request={request}/>
            )}
            {/* Dynamic action buttons based on permissions */}
            <RequestShowActionButtons
                request={request}
                auth={auth}
            />

        </FrontendLayout>
    );
}
