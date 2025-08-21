import {useState, useCallback} from 'react';
import {router} from '@inertiajs/react';
import {OCDRequest, OCDRequestStatus} from '@/types';
import {Action} from '@/components/ui/data-table/common/dropdown-actions';
import {UseRequestActionsReturn} from '@/types/request-actions';



export function useRequestActions(context: 'admin' | 'user' = 'user'): UseRequestActionsReturn {
    // Dialog state management
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<OCDRequest | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [availableStatuses, setAvailableStatuses] = useState<OCDRequestStatus[]>([]);

    // Action handlers
    const handleViewDetails = useCallback((request: OCDRequest) => {
        const routeName = context === 'admin' ? 'admin.request.show' : 'request.show';
        router.visit(route(routeName, {id: request.id}));
    }, [context]);

    const handleEdit = useCallback((request: OCDRequest) => {
        router.visit(route('request.edit', {id: request.id}));
    }, [context]);

    const handleDelete = useCallback((request: OCDRequest) => {
        if (confirm('Are you sure you want to delete this request?')) {
            router.delete(route( 'request.destroy', {id: request.id}));
        }
    }, [context]);

    const handleManageOffers = useCallback((request: OCDRequest) => {
        router.visit(route('admin.offer.list', {request: request.id}));
    }, [context]);

    const handleAcceptOffer = useCallback((request: OCDRequest) => {
        if (request.active_offer) {
            router.post(route('request.accept.offer', {id: request.id}));
        }
    }, []);

    const handleRequestClarifications = useCallback((request: OCDRequest) => {
        router.post(route('request.clarification', {id: request.id}));
    }, []);

    const handleUpdateStatus = useCallback((request: OCDRequest, statuses: OCDRequestStatus[] = []) => {
        setSelectedRequest(request);
        setAvailableStatuses(statuses);
        setIsStatusDialogOpen(true);
    }, []);

    const handleAddOffer = useCallback((request: OCDRequest) => {
        router.visit(route('admin.offer.create', {request_id: request.id}));
    }, []);

    const handleSeeOffers = useCallback((request: OCDRequest) => {
        router.visit(route('admin.offer.list', {id: request.id}));
    }, []);

    // Dialog actions
    const closeStatusDialog = useCallback(() => {
        setIsStatusDialogOpen(false);
        setSelectedRequest(null);
        setAvailableStatuses([]);
    }, []);

    // Build actions for a specific request
    const getActionsForRequest = useCallback((
        request: OCDRequest,
        customAvailableStatuses?: OCDRequestStatus[]
    ): Action[] => {
        const actions: Action[] = [];

        // View Details
        if (request.permissions.can_view) {
            actions.push({
                key: 'view-details',
                label: 'View Details',
                onClick: () => handleViewDetails(request),
            });
        }

        // Update Status
        if (request.permissions.can_update_status) {
            actions.push({
                key: 'update-status',
                label: 'Update Status',
                onClick: () => handleUpdateStatus(request, customAvailableStatuses || []),
                divider: actions.length > 0,
            });
        }

        // Edit Request
        if (request.permissions.can_edit) {
            actions.push({
                key: 'edit',
                label: 'Edit Request',
                onClick: () => handleEdit(request),
                divider: actions.length > 0 && !request.permissions.can_update_status,
            });
        }

        // Manage Offers
        if (request.permissions.can_manage_offers) {
            actions.push({
                key: 'manage-offers',
                label: 'Manage Offers',
                onClick: () => handleManageOffers(request),
                divider: actions.length > 0,
            });
        }

        // Accept Offer
        if (request.permissions.can_accept_offer && request.active_offer) {
            actions.push({
                key: 'accept-offer',
                label: 'Accept Offer',
                onClick: () => handleAcceptOffer(request),
            });
        }

        // Request Clarifications
        if (request.permissions.can_request_clarifications) {
            actions.push({
                key: 'request-clarifications',
                label: 'Request Clarifications',
                onClick: () => handleRequestClarifications(request),
            });
        }

        // Delete Request
        if (request.permissions.can_delete) {
            actions.push({
                key: 'delete',
                label: 'Delete Request',
                onClick: () => handleDelete(request),
                divider: true,
            });
        }

        return actions;
    }, [handleViewDetails, handleUpdateStatus, handleEdit, handleDelete,
        handleManageOffers, handleAcceptOffer, handleRequestClarifications]);

    return {
        // State
        isStatusDialogOpen,
        selectedRequest,
        isLoading,
        availableStatuses,
        // Actions
        closeStatusDialog,
        getActionsForRequest,
    };
}
