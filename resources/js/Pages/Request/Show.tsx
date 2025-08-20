import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import OfferDetailsSection from '@/components/ui/request/show/offer-details-section';
import React from 'react';
import RequestDetails from '@/components/ui/request/show/request-details';
import {Head} from '@inertiajs/react';
import {Heading} from "@/components/ui/heading";
import {OCDRequest, PageProps, RequestOffer} from '@/types';
import {RequestShowActionButtons} from '@/components/ui/request/RequestShowActionButtons';

interface ShowRequestProps extends PageProps<{
    request: OCDRequest;
    activeOffer?: RequestOffer;
}> {
}

export default function ShowRequest({
                                        auth,
                                        request,
                                        activeOffer,
                                    }: Readonly<ShowRequestProps>) {

    return (
        <FrontendLayout>
            <Head title={`Request: ${request.id}`}/>
            <Heading className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Request Details
            </Heading>
            <RequestDetails request={request}/>

            {/* Display offer details if there's an active offer */}
            {activeOffer && (
                <OfferDetailsSection offer={activeOffer}/>
            )}

            {/* Dynamic action buttons based on permissions */}

            <RequestShowActionButtons
                request={request}
                activeOffer={activeOffer}
            />

        </FrontendLayout>
    );
}
