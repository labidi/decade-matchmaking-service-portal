import React, {useState} from 'react';
import {Head, usePage, Link} from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import {OCDRequest, OCDRequestGrid, RequestOffer} from '@/types';
import OfferSection from '@/Pages/Request/Components/OfferSection';
import RequestDetailsSection from '@/Pages/Request/Components/RequestDetailsSection';
import XHRAlertDialog from '@/Components/Dialogs/XHRAlertDialog';


export default function ShowRequest() {
    const OcdRequest = usePage().props.request as OCDRequest;
    const RequestPageDetails = usePage().props.requestDetail as OCDRequestGrid;
    const OcdRequestOffer = usePage().props.offer as RequestOffer;
    const [clarificationOpen, setClarificationOpen] = useState(false);
    const [AcceptOfferOpen, setAcceptOfferOpen] = useState(false);
    const previewFields = [
        'capacity_development_title',
        'support_months',
        'subthemes',
        'related_activity',
        'support_types',
        'delivery_format',
        'delivery_countries',
        'target_audience',
        'gap_description'
    ];
    return (
        <FrontendLayout>
            <Head title={`Request: ${OcdRequest.id}`}/>

            <RequestDetailsSection OcdRequest={OcdRequest} fieldsToShow={previewFields}/>

            {/* Separator */}
            <div className="border-t border-gray-200 my-6"/>

            {/* Actions */}
            <div className="mt-8 flex space-x-4">


                {RequestPageDetails.actions.canRequestClarificationForOffer && (
                    <>
                        <XHRAlertDialog
                            open={clarificationOpen}
                            onOpenChange={setClarificationOpen}
                            type="info"
                            message="A request for clarification has been sent to the IOC Secretariat."
                        />
                        <button
                            id="request-clarification-from-ioc"
                            type="button"
                            onClick={() => setClarificationOpen(true)}
                            className="px-4 py-2 bg-firefly-200 text-gray-800 rounded hover:bg-firefly-300"
                        >
                            Request clarification from IOC
                        </button>
                    </>
                )}

            </div>


        </FrontendLayout>
    );
}
