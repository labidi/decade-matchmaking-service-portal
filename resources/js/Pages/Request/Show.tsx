import FrontendLayout from '@/Layouts/FrontendLayout';
import OfferSection from '@/Pages/Request/Components/OfferSection';
import React, {useState} from 'react';
import RequestDetailsSection from '@/Pages/Request/Components/RequestDetailsSection';
import XHRAlertDialog from '@/Components/Dialogs/XHRAlertDialog';
import {Head, usePage, Link} from '@inertiajs/react';
import {OCDRequest, OCDRequestGrid} from '@/types';

export default function ShowRequest() {
    const OcdRequest = usePage().props.request as OCDRequest;
    const RequestPageDetails = usePage().props.requestDetail as OCDRequestGrid;
    const [clarificationOpen, setClarificationOpen] = useState(false);
    const [AcceptOfferOpen, setAcceptOfferOpen] = useState(false);

    return (
        <FrontendLayout>
            <Head title={`Request: ${OcdRequest.id}`}/>

            <RequestDetailsSection OcdRequest={OcdRequest}/>
            {OcdRequest.active_offer && (
                <OfferSection OcdRequest={OcdRequest}/>
            )}

            {/* Separator */}
            <div className="border-t border-gray-200 my-6"/>

            {/* Actions */}
            <div className="mt-8 flex space-x-4">

                {RequestPageDetails.actions.canExportPdf && (
                    <a
                        href={route('user.request.pdf', {id: OcdRequest.id})}
                        className="px-4 py-2 bg-firefly-200 text-gray-800 rounded hover:bg-firefly-300"
                    >
                        Export the Request as PDF
                    </a>
                )}

                {RequestPageDetails.actions.canEdit && (
                    <Link
                        href={route('request.me.list')}
                        className="px-4 py-2 bg-firefly-200 text-gray-800 rounded hover:bg-firefly-300"
                    >
                        Edit
                    </Link>
                )}

                {RequestPageDetails.actions.canDelete && (
                    <Link
                        href={route('request.me.list')}
                        className="px-4 py-2 bg-firefly-200 text-gray-800 rounded hover:bg-firefly-300"
                    >
                        Delete
                    </Link>
                )}

                {RequestPageDetails.actions.canAcceptOffer && (
                    <>
                        <XHRAlertDialog
                            open={AcceptOfferOpen}
                            onOpenChange={setAcceptOfferOpen}
                            type="info"
                            message="IOC Secretariat will get back to you with proposal for induction meeting between your partner and your "
                        />
                        <button
                            onClick={() => setAcceptOfferOpen(true)}
                            className="px-4 py-2 bg-firefly-200 text-gray-800 rounded hover:bg-firefly-300"
                        >
                            Accept Offer
                        </button>
                    </>

                )}

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
