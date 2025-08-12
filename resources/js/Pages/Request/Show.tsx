import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import React from 'react';
import RequestDetails from '@/components/ui/request/show/request-details';
import OfferDetailsSection from '@/components/ui/request/show/offer-details-section';
import {Head, router} from '@inertiajs/react';
import {OCDRequest, OCDRequestGrid, RequestOffer} from '@/types';
import {Heading} from "@/components/ui/heading";
import {Button} from '@/components/ui/button';

interface ShowRequestProps {
    request: OCDRequest;
    requestDetail: OCDRequestGrid;
    activeOffer?: RequestOffer;
    canManageOfferResponse?: boolean;
}

export default function ShowRequest({request, requestDetail, activeOffer, canManageOfferResponse}: Readonly<ShowRequestProps>) {
    const shouldShowOfferResponseButtons = 
        request.status.status_code === 'offer_made' && 
        activeOffer && 
        canManageOfferResponse;

    const handleAcceptOffer = () => {
        if (!activeOffer) return;
        
        router.post(route('request.accept-offer', {
            request: request.id,
            offer: activeOffer.id
        }), {}, {
            onSuccess: () => {
                // Handle success if needed
            },
            onError: (errors) => {
                console.error('Error accepting offer:', errors);
            }
        });
    };

    const handleRequestClarifications = () => {
        if (!activeOffer) return;
        
        router.post(route('request.request-clarifications', {
            request: request.id,
            offer: activeOffer.id
        }), {}, {
            onSuccess: () => {
                // Handle success if needed  
            },
            onError: (errors) => {
                console.error('Error requesting clarifications:', errors);
            }
        });
    };

    return (
        <FrontendLayout>
            <Head title={`Request: ${request.id}`}/>
            <Heading className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Request Details
            </Heading>
            <RequestDetails request={request}/>

            {/* Display offer details if there's an active offer */}
            {activeOffer && (
                <OfferDetailsSection offer={activeOffer} />
            )}
            
            {/* Conditional offer response buttons */}
            {shouldShowOfferResponseButtons && (
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <Button 
                        color="green"
                        onClick={handleAcceptOffer}
                    >
                        Accept Offer
                    </Button>
                    <Button 
                        outline 
                        onClick={handleRequestClarifications}
                    >
                        Request clarifications from IOC
                    </Button>
                </div>
            )}
        </FrontendLayout>
    );
}
