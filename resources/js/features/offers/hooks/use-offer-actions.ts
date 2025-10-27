import {useCallback} from 'react';
import {RequestOffer} from '../types/offer.types';
import {Action} from '@ui/organisms/data-table/common';
import {OfferActionService} from '../services/offer.service';

export interface UseOfferActionsReturn {
    getActionsForOffer: (
        offer: RequestOffer,
        customAvailableStatuses?: Array<{ value: string; label: string }>
    ) => Action[];
}

export function useOfferActions(context: 'admin' | 'user' = 'admin'): UseOfferActionsReturn {

    // Action handlers using OfferActionService
    const handleViewDetails = useCallback((offer: RequestOffer) => {
        OfferActionService.viewDetails(offer, context);
    }, [context]);

    const handleEdit = useCallback((offer: RequestOffer) => {
        OfferActionService.edit(offer);
    }, []);

    const handleDelete = useCallback((offer: RequestOffer) => {
        OfferActionService.delete(offer);
    }, []);

    const handleAccept = useCallback((offer: RequestOffer) => {
        OfferActionService.accept(offer);
    }, []);

    const handleReject = useCallback((offer: RequestOffer) => {
        OfferActionService.reject(offer);
    }, []);

    const handleRequestClarifications = useCallback((offer: RequestOffer) => {
        OfferActionService.requestClarifications(offer);
    }, []);

    const handleManageDocuments = useCallback((offer: RequestOffer) => {
        OfferActionService.manageDocuments(offer);
    }, []);

    const handleViewRequest = useCallback((offer: RequestOffer) => {
        OfferActionService.viewRequest(offer);
    }, []);

    const handleExportPdf = useCallback((offer: RequestOffer) => {
        OfferActionService.exportPdf(offer);
    }, []);

    const handleEnableOffer = useCallback((offer: RequestOffer) => {
        OfferActionService.enable(offer);
    }, []);

    const handleDisableOffer = useCallback((offer: RequestOffer) => {
        OfferActionService.disable(offer);
    }, []);

    // Build actions for a specific offer
    const getActionsForOffer = useCallback((
        offer: RequestOffer,
        customAvailableStatuses?: Array<{ value: string; label: string }>
    ): Action[] => {
        const actions: Action[] = [];

        // View Details
        if (offer.permissions.can_view) {
            actions.push({
                key: 'view-details',
                label: 'View Details',
                onClick: () => handleViewDetails(offer),
            });
        }

        // View Related Request
        if (offer.request && offer.permissions.can_view) {
            actions.push({
                key: 'view-request',
                label: 'View Request',
                onClick: () => handleViewRequest(offer),
            });
        }

        // Update Status
        if (offer.permissions.can_enable) {
            actions.push({
                key: 'enable-offer',
                label: 'Enable Offer',
                onClick: () => handleEnableOffer(offer),
                divider: actions.length > 0,
            });
        }

        // Update Status
        if (offer.permissions.can_disable) {
            actions.push({
                key: 'disable-offer',
                label: 'Disable Offer',
                onClick: () => handleDisableOffer(offer),
            });
        }

        // Edit Offer
        if (offer.permissions.can_edit) {
            actions.push({
                key: 'edit',
                label: 'Edit Offer',
                onClick: () => handleEdit(offer),
                divider: actions.length > 0 && !offer.permissions.can_edit,
            });
        }

        // Accept Offer
        if (offer.permissions.can_accept && !offer.is_accepted) {
            actions.push({
                key: 'accept-offer',
                label: 'Accept Offer',
                onClick: () => handleAccept(offer),
                divider: actions.length > 0,
            });
        }

        // Reject Offer
        if (offer.permissions.can_reject && !offer.is_accepted) {
            actions.push({
                key: 'reject-offer',
                label: 'Reject Offer',
                onClick: () => handleReject(offer),
            });
        }

        // Request Clarifications
        if (offer.permissions.can_request_clarifications) {
            actions.push({
                key: 'request-clarifications',
                label: 'Request Clarifications',
                onClick: () => handleRequestClarifications(offer),
                divider: actions.length > 0,
            });
        }

        // Manage Documents
        if (offer.permissions.can_manage_documents) {
            actions.push({
                key: 'manage-documents',
                label: 'Manage Documents',
                onClick: () => handleManageDocuments(offer),
                divider: actions.length > 0,
            });
        }

        // Delete Offer
        if (offer.permissions.can_delete) {
            actions.push({
                key: 'delete',
                label: 'Delete Offer',
                onClick: () => handleDelete(offer),
                divider: true,
            });
        }

        return actions;
    }, [
        handleViewDetails,
        handleViewRequest,
        handleEnableOffer,
        handleDisableOffer,
        handleEdit,
        handleAccept,
        handleReject,
        handleRequestClarifications,
        handleManageDocuments,
        handleExportPdf,
        handleDelete
    ]);

    return {
        getActionsForOffer,
    };
}
