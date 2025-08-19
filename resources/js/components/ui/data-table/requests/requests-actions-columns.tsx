import React, { useState } from 'react';
import {router} from '@inertiajs/react';
import {DropdownActions, Action} from '@/components/ui/data-table/common/dropdown-actions';
import {OCDRequest, OCDRequestStatus} from '@/types';
import { UpdateStatusDialog } from '@/components/ui/dialogs/UpdateStatusDialog';

interface RequestActionsProps {
    request: OCDRequest;
    showViewDetails?: boolean;
    availableStatuses?: OCDRequestStatus[];
}

// Helper function to build actions - can be used independently
export function buildRequestActions(
    request: OCDRequest,
    onUpdateStatus?: (request: OCDRequest) => void,
    showViewDetails: boolean = true
): Action[] {
    const actions: Action[] = [];

    // View Details - available if user can view and we want to show it
    if (request.can_view && showViewDetails) {
        actions.push({
            key: 'view-details',
            label: 'View Details',
            onClick: () => router.visit(route('admin.request.show', {id: request.id}))
        });
    }

    // Update Status - available if user can update status
    if (request.can_update_status && onUpdateStatus) {
        actions.push({
            key: 'update-status',
            label: 'Update Status',
            onClick: () => onUpdateStatus(request),
            divider: actions.length > 0
        });
    }

    // Add New Offer - available if user can manage offers
    if (request.can_manage_offers) {
        actions.push({
            key: 'add-offer',
            label: 'Add New Offer',
            onClick: () => router.visit(route('admin.offer.create', {request_id: request.id})),
            divider: actions.length > 0
        });

        actions.push({
            key: 'see-offers',
            label: 'See request offers',
            onClick: () => router.visit(route('admin.offer.list', {id: request.id}))
        });
    }

    return actions;
}

export function RequestActions({
                                   request,
                                   showViewDetails = true,
                                   availableStatuses = []
                               }: Readonly<RequestActionsProps>) {
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<OCDRequest | null>(null);

    const handleUpdateStatus = (request: OCDRequest) => {
        setSelectedRequest(request);
        setIsStatusDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsStatusDialogOpen(false);
        setSelectedRequest(null);
    };

    const actions = buildRequestActions(request, handleUpdateStatus, showViewDetails);

    return (
        <>
            <DropdownActions actions={actions}/>

            {/* Status Update Dialog */}
            <UpdateStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={handleCloseDialog}
                request={selectedRequest}
                availableStatuses={availableStatuses}
            />
        </>
    );
}
