import React from 'react';
import { Button } from '@ui/primitives/button';
import { clsx } from 'clsx';
import {
    CheckIcon,
    QuestionMarkCircleIcon,
    PencilSquareIcon,
    TrashIcon,
    DocumentTextIcon
} from '@heroicons/react/16/solid';
import {OCDRequest} from '../types/request.types';
import {RequestActionService} from '../services/request.service';

export interface RequestShowActionButtonsProps {
    request: OCDRequest;
    auth?: import('@/types').Auth;
    className?: string;
    layout?: 'horizontal' | 'vertical';
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
    className,
    layout = 'horizontal'
}: Readonly<RequestShowActionButtonsProps>) {

    const handleAcceptOffer = () => {
        RequestActionService.acceptOffer(request);
    };

    const handleRequestClarifications = () => {
        RequestActionService.requestClarifications(request);
    };

    const handleEdit = () => {
        RequestActionService.edit(request);
    };

    const handleDelete = () => {
        RequestActionService.delete(request, (errors: unknown) => {
            // Errors are already logged in RequestActionService
            // Additional error handling can be added here if needed
        });
    };

    const handleExportPdf = () => {
        RequestActionService.exportPdf(request);
    };

    const handleViewOffers = () => {
        RequestActionService.viewOffers(request);
    };

    // Collect all available actions based on permissions
    const actions = [];

    if(request.permissions.can_express_interest){
        actions.push(
            <Button
                key="express-interest"
                color="blue"
                onClick={() => RequestActionService.expressInterest(request)}
                className={clsx("flex items-center gap-2", layout === 'vertical' && "w-full justify-center")}
            >
                <CheckIcon data-slot="icon" />
                Express Interest
            </Button>
        );
    }
    // Offer-related actions (highest priority)
    if (request.active_offer && request.permissions.can_accept_offer) {
        actions.push(
            <Button
                key="accept-offer"
                color="green"
                onClick={handleAcceptOffer}
                className={clsx("flex items-center gap-2", layout === 'vertical' && "w-full justify-center")}
            >
                <CheckIcon data-slot="icon" />
                Accept Offer
            </Button>
        );
    }

    if (request.permissions.can_request_clarifications) {
        actions.push(
            <Button
                key="request-clarifications"
                outline
                onClick={handleRequestClarifications}
                className={clsx("flex items-center gap-2", layout === 'vertical' && "w-full justify-center")}
            >
                <QuestionMarkCircleIcon data-slot="icon" />
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
                className={clsx("flex items-center gap-2", layout === 'vertical' && "w-full justify-center")}
            >
                <PencilSquareIcon data-slot="icon" />
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
                className={clsx("flex items-center gap-2", layout === 'vertical' && "w-full justify-center")}
            >
                <DocumentTextIcon data-slot="icon" />
                View All Offers ({request.offers.length})
            </Button>
        );
    }

    // Always allow PDF export for request owners and admins
    if (request.permissions.can_view) {
        actions.push(
            <Button
                key="export-pdf"
                outline
                onClick={handleExportPdf}
                className={clsx("flex items-center gap-2", layout === 'vertical' && "w-full justify-center")}
            >
                <DocumentTextIcon data-slot="icon" />
                Export PDF
            </Button>
        );
    }

    if (request.permissions.can_delete) {
        actions.push(
            <Button
                key="delete"
                color="red"
                onClick={handleDelete}
                className={clsx("flex items-center gap-2", layout === 'vertical' && "w-full justify-center")}
            >
                <TrashIcon data-slot="icon" />
                Delete Request
            </Button>
        );
    }

    // Don't render anything if no actions are available
    if (actions.length === 0) {
        return null;
    }

    return (
        <div
            className={clsx(
                'actions-buttons flex gap-3',
                layout === 'horizontal' ? 'flex-wrap items-center justify-end mt-6' : 'flex-col items-stretch',
                className
            )}
            role="group"
            aria-label="Request action buttons"
        >
            {actions}
        </div>
    );
}
