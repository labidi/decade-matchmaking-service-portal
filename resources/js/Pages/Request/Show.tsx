import FrontendLayout from '@/Layouts/FrontendLayout';
import OfferSection from '@/Pages/Request/Components/OfferSection';
import React from 'react';
import RequestDetailsSection from '@/Pages/Request/Components/RequestDetailsSection';
import RequestActions from '@/Pages/Request/Components/RequestActions';
import {Head} from '@inertiajs/react';
import {OCDRequest, OCDRequestGrid} from '@/types';

interface ShowRequestProps {
    request: OCDRequest;
    requestDetail: OCDRequestGrid;
}

export default function ShowRequest({request, requestDetail}: Readonly<ShowRequestProps>) {
    return (
        <FrontendLayout>
            <Head title={`Request: ${request.id}`}/>
            <RequestDetailsSection OcdRequest={request}/>
            {request.active_offer && (
                <OfferSection OcdRequest={request}/>
            )}
            <RequestActions request={request} requestDetail={requestDetail}/>
        </FrontendLayout>
    );
}
