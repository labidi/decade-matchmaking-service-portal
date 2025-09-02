import {useCallback} from 'react';
import {router, usePage} from '@inertiajs/react';
import {Opportunity, Auth} from '@/types';
import {Action} from '@/components/ui/data-table/common/dropdown-actions';
import {OpportunityActionService} from "@/services/opportunityActionService";
import {
    OpportunityActionContext,
    UseOpportunityActionsReturn
} from '@/types/opportunity-actions';

export function useOpportunityActions(context: 'admin' | 'user' = 'user'): UseOpportunityActionsReturn {
    const {auth} = usePage<{ auth: Auth }>().props;

    // Action handlers
    const handleViewDetails = useCallback((opportunity: Opportunity) => {
        OpportunityActionService.view(opportunity, context);
    }, []);

    const handleEdit = useCallback((opportunity: Opportunity) => {
        router.visit(route('opportunity.edit', {id: opportunity.id}));
    }, []);

    const handleUpdateStatus = useCallback((opportunity: Opportunity) => {
        console.log('Update status for opportunity:', opportunity);
    }, []);

    const handleDelete = useCallback((opportunity: Opportunity) => {
        if (!confirm('Are you sure you want to delete this opportunity?')) {
            return;
        }

        // setIsLoading(true);
        router.delete(route('partner.opportunity.destroy', {id: opportunity.id}), {
            onSuccess: () => {
                // setIsLoading(false);
            },
            onError: (errors) => {
                console.error('Failed to delete opportunity:', errors);
                alert('Failed to delete opportunity. Please try again.');
                // setIsLoading(false);
            }
        });
    }, []);

    // Build actions for a specific opportunity
    const getActionsForOpportunity = useCallback((
        opportunity: Opportunity,
        customPermissions?: OpportunityActionContext['permissions']
    ): Action[] => {
        const actions: Action[] = [];

        if(opportunity.permissions?.can_view){
            actions.push({
                key: 'view-details',
                label: 'View details',
                onClick: () => handleViewDetails(opportunity),
                divider: actions.length > 0,
            });
        }

        if(opportunity.permissions?.can_edit){
            actions.push({
                key: 'edit',
                label: 'Edit details',
                onClick: () => handleEdit(opportunity),
                divider: actions.length > 0,
            });
        }

        if(opportunity.permissions?.can_delete){
            actions.push({
                key: 'delete',
                label: 'Delete Opportunity',
                onClick: () => handleDelete(opportunity),
                divider: actions.length > 0,
            });
        }

        if(opportunity.permissions?.can_reject){
            actions.push({
                key: 'reject',
                label: 'Reject Opportunity',
                onClick: () => handleDelete(opportunity),
                divider: actions.length > 0,
            });
        }
        if(opportunity.permissions?.can_approve){
            actions.push({
                key: 'approve',
                label: 'Approve Opportunity',
                onClick: () => handleDelete(opportunity),
            });
        }
        return actions;


    }, [auth, handleViewDetails, handleEdit, handleUpdateStatus, handleDelete]);

    return {
        getActionsForOpportunity,
    };
}
