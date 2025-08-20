import React from 'react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { clsx } from 'clsx';
import {
    CheckIcon,
    QuestionMarkCircleIcon,
    PencilSquareIcon,
    TrashIcon,
    DocumentTextIcon
} from '@heroicons/react/16/solid';
import {OCDRequest} from "@/types";

export interface RequestShowActionButtonsProps {
    request: OCDRequest;
    auth?: import('@/types').Auth;
    className?: string;
}
/**
 * RequestShowActionButtons - Specialized action buttons for the Request Show page
 *
 * This component renders permission-based action buttons specifically for the request show page.
 * It uses the permissions object from the backend to conditionally display buttons.
 */
export function RequestShowActionButtons({
    request,
    auth,
    className
}: Readonly<RequestShowActionButtonsProps>) {

    const handleAcceptOffer = () => {
        if (!request.active_offer) return;
        router.post(route('offer.accept', {
            id: request.active_offer.id,
        }));
    };

    const handleRequestClarifications = () => {
        if (!request.active_offer) return;
        router.post(route('request.request-clarifications', {
            request: request.id,
            offer: request.active_offer.id
        }));
    };

    const handleEdit = () => {
        router.visit(route('request.edit', { id: request.id }));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
            router.delete(route('request.destroy', { id: request.id }), {
                onError: (errors) => {
                    console.error('Error deleting request:', errors);
                }
            });
        }
    };

    const handleExportPdf = () => {
        window.open(route('request.export-pdf', { id: request.id }), '_blank');
    };

    const handleViewOffers = () => {
        router.visit(route('request.offers', { id: request.id }));
    };

    // Collect all available actions based on permissions
    const actions = [];
    // Offer-related actions (highest priority)
    if (request.active_offer && request.permissions.can_accept_offer) {
        actions.push(
            <Button
                key="accept-offer"
                color="green"
                onClick={handleAcceptOffer}
                className="flex items-center gap-2"
            >
                <CheckIcon className="h-4 w-4" data-slot="icon" />
                Accept Offer
            </Button>
        );
    }

    if (request.active_offer && request.permissions.can_request_clarifications) {
        actions.push(
            <Button
                key="request-clarifications"
                outline
                onClick={handleRequestClarifications}
                className="flex items-center gap-2"
            >
                <QuestionMarkCircleIcon className="h-4 w-4" data-slot="icon" />
                Request clarifications from IOC
            </Button>
        );
    }

    // Request management actions
    if (request.permissions.can_edit) {
        actions.push(
            <Button
                key="edit"
                onClick={handleEdit}
                className="flex items-center gap-2"
            >
                <PencilSquareIcon className="h-4 w-4" data-slot="icon" />
                Edit Request
            </Button>
        );
    }

    if (request.permissions.can_manage_offers && request.offers && request.offers.length > 0) {
        actions.push(
            <Button
                key="view-offers"
                outline
                onClick={handleViewOffers}
                className="flex items-center gap-2"
            >
                <DocumentTextIcon className="h-4 w-4" data-slot="icon" />
                View All Offers ({request.offers.length})
            </Button>
        );
    }


    if (request.permissions.can_delete) {
        actions.push(
            <Button
                key="delete"
                color="red"
                onClick={handleDelete}
                className="flex items-center gap-2"
            >
                <TrashIcon className="h-4 w-4" data-slot="icon" />
                Delete Request
            </Button>
        );
    }

    // Don't render anything if no actions are available
    if (actions.length === 0) {
        return null;
    }

    return (
        <div className={clsx(
            'actions-buttons flex flex-wrap items-center justify-end gap-3 mt-6',
            className
        )}>
            {actions}
        </div>
    );
}
