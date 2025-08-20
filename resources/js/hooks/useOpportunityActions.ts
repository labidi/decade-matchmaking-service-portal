import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Opportunity, Auth } from '@/types';
import { Action } from '@/components/ui/data-table/common/dropdown-actions';
import { 
    OpportunityActionContext,
    UseOpportunityActionsReturn 
} from '@/types/opportunity-actions';
import { buildOpportunityActions } from '@/utils/opportunity-action-builder';

export function useOpportunityActions(): UseOpportunityActionsReturn {
    const { auth } = usePage<{ auth: Auth }>().props;
    
    // Dialog state management
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Action handlers
    const handleViewDetails = useCallback((opportunity: Opportunity) => {
        router.visit(route('opportunity.show', { id: opportunity.id }));
    }, []);
    
    const handleEdit = useCallback((opportunity: Opportunity) => {
        router.visit(route('partner.opportunity.edit', { id: opportunity.id }));
    }, []);
    
    const handleUpdateStatus = useCallback((opportunity: Opportunity) => {
        setSelectedOpportunity(opportunity);
        setIsStatusDialogOpen(true);
    }, []);
    
    const handleDelete = useCallback((opportunity: Opportunity) => {
        if (!confirm('Are you sure you want to delete this opportunity?')) {
            return;
        }
        
        setIsLoading(true);
        router.delete(route('partner.opportunity.destroy', { id: opportunity.id }), {
            onSuccess: () => {
                setIsLoading(false);
            },
            onError: (errors) => {
                console.error('Failed to delete opportunity:', errors);
                alert('Failed to delete opportunity. Please try again.');
                setIsLoading(false);
            }
        });
    }, []);
    
    // Dialog actions
    const closeStatusDialog = useCallback(() => {
        setIsStatusDialogOpen(false);
        setSelectedOpportunity(null);
    }, []);
    
    // Build actions for a specific opportunity
    const getActionsForOpportunity = useCallback((
        opportunity: Opportunity,
        customPermissions?: OpportunityActionContext['permissions']
    ): Action[] => {
        const context: OpportunityActionContext = {
            opportunity,
            auth,
            permissions: customPermissions || {
                canEdit: opportunity.can_edit || auth.user.is_admin,
                canDelete: opportunity.user_id === String(auth.user.id) || auth.user.is_admin,
                canUpdateStatus: auth.user.is_admin,
            }
        };
        
        return buildOpportunityActions(context, {
            onViewDetails: handleViewDetails,
            onEdit: handleEdit,
            onUpdateStatus: handleUpdateStatus,
            onDelete: handleDelete,
        });
    }, [auth, handleViewDetails, handleEdit, handleUpdateStatus, handleDelete]);
    
    return {
        // State
        isStatusDialogOpen,
        selectedOpportunity,
        isLoading,
        
        // Actions
        closeStatusDialog,
        getActionsForOpportunity,
        
        // Direct handlers (if needed)
        handleDelete,
        handleUpdateStatus,
    };
}