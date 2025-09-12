import {useCallback} from 'react';
import {router, usePage} from '@inertiajs/react';
import {Opportunity, Auth , Context} from '@/types';
import {Action} from '@/components/ui/data-table/common/dropdown-actions';
import {OpportunityActionService} from "@/services/opportunityActionService";
import {
    OpportunityActionContext,
    UseOpportunityActionsReturn
} from '@/types/opportunity-actions';
import {useConfirmation, useDeleteConfirmation} from '@/components/ui/confirmation';

export function useOpportunityActions(context: Context , showRouteName : string): UseOpportunityActionsReturn {
    const {auth} = usePage<{ auth: Auth }>().props;
    const { confirm } = useConfirmation();
    const deleteConfirmation = useDeleteConfirmation();

    // Action handlers
    const handleViewDetails = useCallback((opportunity: Opportunity) => {
        OpportunityActionService.view(opportunity, showRouteName);
    }, []);

    const handleEdit = useCallback((opportunity: Opportunity) => {
        router.visit(route('opportunity.edit', {id: opportunity.id}));
    }, []);


    const handleDelete = useCallback(async (opportunity: Opportunity) => {
        await deleteConfirmation('opportunity', () => {
                OpportunityActionService.delete(opportunity);
        });
    }, [deleteConfirmation]);

    const handleUpdateStatus = useCallback(async (opportunity: Opportunity , status:string) => {

        await confirm({
            title: 'Updating Opportunity status?',
            message: `This will update order status, do you want to proceed.`,
            type: 'warning',
            confirmText: 'confirm',
            confirmButtonColor: 'orange',
            onConfirm: () => {
                OpportunityActionService.updateStatus(opportunity,status);
            }
        });
    }, [confirm]);

    // Build actions for a specific opportunity
    const getActionsForOpportunity = useCallback((
        context : Context,
        opportunity: Opportunity,
        customPermissions?: OpportunityActionContext['permissions']
    ): Action[] => {
        const actions: Action[] = [];

        if (opportunity.permissions?.can_view) {
            actions.push({
                key: 'view-details',
                label: 'View details',
                onClick: () => handleViewDetails(opportunity),
                divider: actions.length > 0,
            });
        }

        if (opportunity.permissions?.can_edit) {
            actions.push({
                key: 'edit',
                label: 'Edit details',
                onClick: () => handleEdit(opportunity),
                divider: actions.length > 0,
            });
        }

        if (opportunity.permissions?.can_delete) {
            actions.push({
                key: 'delete',
                label: 'Delete Opportunity',
                onClick: () => handleDelete(opportunity),
                divider: actions.length > 0,
            });
        }

        if (opportunity.permissions?.can_reject) {
            actions.push({
                key: 'reject',
                label: 'Reject Opportunity',
                onClick: () => handleUpdateStatus(opportunity,'3'),
                divider: actions.length > 0,
            });
        }
        if (opportunity.permissions?.can_approve) {
            actions.push({
                key: 'approve',
                label: 'Approve Opportunity',
                onClick: () => handleUpdateStatus(opportunity,'1'),
                divider: actions.length > 0,
            });
        }
        if (opportunity.permissions?.can_close) {
            actions.push({
                key: 'close',
                label: 'Close Opportunity',
                onClick: () => handleUpdateStatus(opportunity , '2'),
                divider: actions.length > 0,
            });
        }
        return actions;
    }, [auth, handleViewDetails, handleEdit, handleDelete, handleUpdateStatus]);

    return {
        getActionsForOpportunity,
    };
}
