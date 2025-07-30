import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import React from 'react';
import RequestDetails from '@/components/ui/request/show/request-details';
import {Head} from '@inertiajs/react';
import {OCDRequest, OCDRequestGrid} from '@/types';
import {Heading} from "@/components/ui/heading";

interface ShowRequestProps {
    request: OCDRequest;
    requestDetail: OCDRequestGrid;
}

export default function ShowRequest({request, requestDetail}: Readonly<ShowRequestProps>) {
    return (
        <FrontendLayout>
            <Head title={`Request: ${request.id}`}/>
            <Heading className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Request Details
            </Heading>
            <RequestDetails request={request}/>
            {/*<GeneralInformations request={request}/>*/}
            {/*{request.active_offer && (*/}
            {/*    <OfferSection OcdRequest={request}/>*/}
            {/*)}*/}
        </FrontendLayout>
    );
}
