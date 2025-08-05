import React, { useState } from 'react';
import {router} from '@inertiajs/react';
import {DropdownActions, Action} from '@/components/ui/data-table/common/dropdown-actions';
import {OCDOpportunity} from '@/types';
import { OpportunityStatusDialog } from '@/components/ui/dialogs/OpportunityStatusDialog';

interface OpportunityActionsProps {
    opportunity: OCDOpportunity;
    showViewDetails?: boolean;
    canUpdateStatus?: boolean;
    canDelete?: boolean;
}

// Helper function to build actions - can be used independently
export function buildOpportunityActions(
    opportunity: OCDOpportunity,
    onUpdateStatus?: (opportunity: OCDOpportunity) => void,
    onDelete?: (opportunity: OCDOpportunity) => void,
    showViewDetails: boolean = true,
    canUpdateStatus: boolean = false,
    canDelete: boolean = false
): Action[] {
    const actions: Action[] = [];

    // View Details - always available for opportunities
    if (showViewDetails) {
        actions.push({
            key: 'view-details',
            label: 'View Details',
            onClick: () => router.visit(route('opportunity.show', {id: opportunity.id}))
        });
    }

    // Edit - available if user can edit this opportunity
    if (opportunity.can_edit) {
        actions.push({
            key: 'edit',
            label: 'Edit Opportunity',
            onClick: () => router.visit(route('opportunity.edit', {id: opportunity.id})),
            divider: actions.length > 0
        });
    }

    // Update Status - available if user can update status
    if (canUpdateStatus) {
        actions.push({
            key: 'update-status',
            label: 'Update Status',
            onClick: () => onUpdateStatus ? onUpdateStatus(opportunity) : handleDirectStatusUpdate(opportunity),
            divider: actions.length > 0
        });
    }

    // Delete - available if user can delete
    if (canDelete) {
        actions.push({
            key: 'delete',
            label: 'Delete Opportunity',
            onClick: () => onDelete ? onDelete(opportunity) : handleDirectDelete(opportunity),
            divider: actions.length > 0
        });
    }

    return actions;
}

// Direct action handlers for when no external handlers are provided
function handleDirectStatusUpdate(opportunity: OCDOpportunity) {
    // This would open a status dialog - for now, we'll use a simple approach
    console.log('Status update for opportunity:', opportunity.id);
    // TODO: Implement direct status update logic
}

function handleDirectDelete(opportunity: OCDOpportunity) {
    if (!confirm('Are you sure you want to delete this opportunity?')) {
        return;
    }

    router.delete(route('partner.opportunity.destroy', {id: opportunity.id}), {
        onSuccess: () => {
            // Opportunity will be removed from list automatically by Inertia
        },
        onError: (errors) => {
            console.error('Failed to delete opportunity:', errors);
            alert('Failed to delete opportunity. Please try again.');
        }
    });
}

export function OpportunityActions({
                                       opportunity,
                                       showViewDetails = true,
                                       canUpdateStatus = false,
                                       canDelete = false
                                   }: Readonly<OpportunityActionsProps>) {
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState<OCDOpportunity | null>(null);

    const handleUpdateStatus = (opportunity: OCDOpportunity) => {
        setSelectedOpportunity(opportunity);
        setIsStatusDialogOpen(true);
    };

    const handleDelete = (opportunity: OCDOpportunity) => {
        if (!confirm('Are you sure you want to delete this opportunity?')) {
            return;
        }

        router.delete(route('partner.opportunity.destroy', {id: opportunity.id}), {
            onSuccess: () => {
                // Opportunity will be removed from list automatically by Inertia
            },
            onError: (errors) => {
                console.error('Failed to delete opportunity:', errors);
                alert('Failed to delete opportunity. Please try again.');
            }
        });
    };

    const handleCloseDialog = () => {
        setIsStatusDialogOpen(false);
        setSelectedOpportunity(null);
    };

    const actions = buildOpportunityActions(
        opportunity,
        handleUpdateStatus,
        handleDelete,
        showViewDetails,
        canUpdateStatus,
        canDelete
    );

    return (
        <>
            <DropdownActions actions={actions}/>

            {/* Status Update Dialog */}
            <OpportunityStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={handleCloseDialog}
                opportunity={selectedOpportunity}
            />
        </>
    );
}
