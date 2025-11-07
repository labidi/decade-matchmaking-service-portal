import React, { useState } from 'react';
import { DropdownActions } from '@ui/organisms/data-table/common';
import { UpdateStatusDialog } from '@ui/organisms/dialogs';
import type { EntityAction } from '@/types/actions';
import { OCDRequest } from '../types';

interface RequestDropdownActionsProps {
    request: OCDRequest;
}

/**
 * RequestDropdownActions - Entity-specific dropdown for request actions
 *
 * Encapsulates action dropdown and dialog management for requests.
 * No prop drilling needed - manages its own state internally.
 */
export function RequestDropdownActions({ request }: Readonly<RequestDropdownActionsProps>) {
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

    /**
     * Handle dialog open requests from DropdownActions
     */
    const handleDialogOpen = (dialogComponent: string, action: EntityAction) => {
        if (dialogComponent === 'UpdateStatusDialog') {
            setIsStatusDialogOpen(true);
        }
    };

    /**
     * Close the status dialog
     */
    const closeStatusDialog = () => {
        setIsStatusDialogOpen(false);
    };

    return (
        <>
            <DropdownActions
                actions={request.actions}
                onDialogOpen={handleDialogOpen}
            />

            {isStatusDialogOpen && (
                <UpdateStatusDialog
                    request={request}
                    isOpen={isStatusDialogOpen}
                    onClose={closeStatusDialog}
                    availableStatuses={[]}
                />
            )}
        </>
    );
}
