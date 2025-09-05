import {useCallback} from 'react';
import {router, usePage} from '@inertiajs/react';
import {Opportunity, Auth} from '@/types';
import {Action} from '@/components/ui/data-table/common/dropdown-actions';
import {OpportunityActionService} from "@/services/opportunityActionService";
import {
    OpportunityActionContext,
    UseOpportunityActionsReturn
} from '@/types/opportunity-actions';
import {useConfirmation, useDeleteConfirmation} from '@/components/ui/confirmation';

export function useOpportunityActions(context: 'admin' | 'user' = 'user'): UseOpportunityActionsReturn {
    const {auth} = usePage<{ auth: Auth }>().props;
    const { confirm } = useConfirmation();
    const deleteConfirmation = useDeleteConfirmation();

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

    const handleDelete = useCallback(async (opportunity: Opportunity) => {
        await deleteConfirmation('opportunity', () => {
            router.delete(route('partner.opportunity.destroy', {id: opportunity.id}), {
                onSuccess: () => {
                    // Opportunity deleted successfully
                },
                onError: (errors) => {
                    console.error('Failed to delete opportunity:', errors);
                    alert('Failed to delete opportunity. Please try again.');
                }
            });
        });
    }, [deleteConfirmation]);

    const handleReject = useCallback(async (opportunity: Opportunity) => {
        await confirm({
            title: 'Reject Opportunity?',
            message: `Are you sure you want to reject "${opportunity.title}"? This action will mark the opportunity as rejected and may not be reversible.`,
            type: 'warning',
            confirmText: 'Reject',
            confirmButtonColor: 'orange',
            onConfirm: () => {
                router.delete(route('partner.opportunity.destroy', {id: opportunity.id}), {
                    onSuccess: () => {
                        // Opportunity rejected successfully
                    },
                    onError: (errors) => {
                        console.error('Failed to reject opportunity:', errors);
                        alert('Failed to reject opportunity. Please try again.');
                    }
                });
            }
        });
    }, [confirm]);
    const handleClose = useCallback(async (opportunity: Opportunity) => {
        await confirm({
            title: 'Close Opportunity?',
            message: `Are you sure you want to close "${opportunity.title}"? This will prevent new applications and mark it as closed.`,
            type: 'warning',
            confirmText: 'Close',
            confirmButtonColor: 'orange',
            onConfirm: () => {
                router.delete(route('partner.opportunity.destroy', {id: opportunity.id}), {
                    onSuccess: () => {
                        // Opportunity closed successfully
                    },
                    onError: (errors) => {
                        console.error('Failed to close opportunity:', errors);
                        alert('Failed to close opportunity. Please try again.');
                    }
                });
            }
        });
    }, [confirm]);

    const handleApprove = useCallback(async (opportunity: Opportunity) => {
        await confirm({
            title: 'Approve Opportunity?',
            message: `Are you sure you want to approve "${opportunity.title}"? This will make it visible to users and allow applications.`,
            type: 'success',
            confirmText: 'Approve',
            confirmButtonColor: 'green',
            onConfirm: () => {
                router.put(route('admin.opportunity.approve', {id: opportunity.id}), {}, {
                    onSuccess: () => {
                        // Opportunity approved successfully
                    },
                    onError: (errors) => {
                        console.error('Failed to approve opportunity:', errors);
                        alert('Failed to approve opportunity. Please try again.');
                    }
                });
            }
        });
    }, [confirm]);

    // Build actions for a specific opportunity
    const getActionsForOpportunity = useCallback((
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
                onClick: () => handleReject(opportunity),
                divider: actions.length > 0,
            });
        }
        if (opportunity.permissions?.can_approve) {
            actions.push({
                key: 'approve',
                label: 'Approve Opportunity',
                onClick: () => handleApprove(opportunity),
                divider: actions.length > 0,
            });
        }
        if (opportunity.permissions?.can_close) {
            actions.push({
                key: 'close',
                label: 'Close Opportunity',
                onClick: () => handleClose(opportunity),
                divider: actions.length > 0,
            });
        }
        return actions;
    }, [auth, handleViewDetails, handleEdit, handleUpdateStatus, handleDelete, handleReject, handleClose, handleApprove]);

    return {
        getActionsForOpportunity,
    };
}
