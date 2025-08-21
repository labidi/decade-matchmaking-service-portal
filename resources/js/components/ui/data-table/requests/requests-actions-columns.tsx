import React from 'react';
import { DropdownActions } from '@/components/ui/data-table/common/dropdown-actions';
import { OCDRequest, OCDRequestStatus } from '@/types';
import { UpdateStatusDialog } from '@/components/ui/dialogs/UpdateStatusDialog';
import { useRequestActions } from '@/hooks/useRequestActions';

interface RequestActionsProps {
    request: OCDRequest;
    showViewDetails?: boolean;
    availableStatuses?: OCDRequestStatus[];
}

export function RequestActions({
    request,
    showViewDetails = true,
    availableStatuses = []
}: Readonly<RequestActionsProps>) {
    const {
        isStatusDialogOpen,
        selectedRequest,
        closeStatusDialog,
        getActionsForRequest,
        availableStatuses: hookStatuses,
    } = useRequestActions();

    const actions = getActionsForRequest(
        request,
        availableStatuses
    );

    return (
        <>
            <DropdownActions actions={actions} />

            <UpdateStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={closeStatusDialog}
                request={selectedRequest}
                availableStatuses={hookStatuses.length > 0 ? hookStatuses : availableStatuses}
            />
        </>
    );
}
