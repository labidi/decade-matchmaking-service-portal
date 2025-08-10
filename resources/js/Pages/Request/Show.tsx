import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import React from 'react';
import RequestDetails from '@/components/ui/request/show/request-details';
import OfferDetailsSection from '@/components/ui/request/show/offer-details-section';
import {Head} from '@inertiajs/react';
import {OCDRequest, OCDRequestGrid, RequestOffer} from '@/types';
import {Heading} from "@/components/ui/heading";

interface ShowRequestProps {
    request: OCDRequest;
    requestDetail: OCDRequestGrid;
    activeOffer?: RequestOffer;
}

export default function ShowRequest({request, requestDetail, activeOffer}: Readonly<ShowRequestProps>) {
    return (
        <FrontendLayout>
            <Head title={`Request: ${request.id}`}/>
            <Heading className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Request Details
            </Heading>
            <RequestDetails request={request}/>
            
            {/* Display offer details if there's an active offer */}
            {activeOffer && (
                <OfferDetailsSection activeOffer={activeOffer} />
            )}
        </FrontendLayout>
    );
}
