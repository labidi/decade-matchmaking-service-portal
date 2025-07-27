import React, { useState } from 'react';
import ActionButton from '@/Components/ActionButton';
import XHRAlertDialog from '@/Components/Dialogs/XHRAlertDialog';
import { OCDRequest, OCDRequestGrid } from '@/types';

interface RequestActionsProps {
    request: OCDRequest;
    requestDetail: OCDRequestGrid;
}

export default function RequestActions({ request, requestDetail }: RequestActionsProps) {
    const [clarificationOpen, setClarificationOpen] = useState(false);
    const [acceptOfferOpen, setAcceptOfferOpen] = useState(false);

    const { actions } = requestDetail;

    return (
        <>
            <div className="border-t border-gray-200 my-6" />

            <div className="mt-8 flex space-x-4">
                {actions.canExportPdf && (
                    <ActionButton
                        type="external"
                        href={route('request.pdf', { id: request.id })}
                    >
                        Export the Request as PDF
                    </ActionButton>
                )}

                {actions.canEdit && (
                    <ActionButton
                        type="link"
                        href={route('request.me.list')}
                    >
                        Edit
                    </ActionButton>
                )}

                {actions.canDelete && (
                    <ActionButton
                        type="link"
                        href={route('request.me.list')}
                    >
                        Delete
                    </ActionButton>
                )}

                {actions.canAcceptOffer && (
                    <ActionButton onClick={() => setAcceptOfferOpen(true)}>
                        Accept Offer
                    </ActionButton>
                )}

                {actions.canRequestClarificationForOffer && (
                    <ActionButton
                        onClick={() => setClarificationOpen(true)}
                        id="request-clarification-from-ioc"
                    >
                        Request clarification from IOC
                    </ActionButton>
                )}
            </div>

            <XHRAlertDialog
                open={acceptOfferOpen}
                onOpenChange={setAcceptOfferOpen}
                type="info"
                message="IOC Secretariat will get back to you with proposal for induction meeting between your partner and your organization."
            />

            <XHRAlertDialog
                open={clarificationOpen}
                onOpenChange={setClarificationOpen}
                type="info"
                message="A request for clarification has been sent to the IOC Secretariat."
            />
        </>
    );
}
