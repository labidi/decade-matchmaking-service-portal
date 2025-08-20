import { Action } from '@/components/ui/data-table/common/dropdown-actions';
import { Opportunity, Auth } from '@/types';
import { OpportunityActionContext } from '@/types/opportunity-actions';

interface ActionHandlers {
    onViewDetails: (opportunity: Opportunity) => void;
    onEdit: (opportunity: Opportunity) => void;
    onUpdateStatus: (opportunity: Opportunity) => void;
    onDelete: (opportunity: Opportunity) => void;
}

export function buildOpportunityActions(
    context: OpportunityActionContext,
    handlers: ActionHandlers
): Action[] {
    const { opportunity, auth, permissions } = context;
    const actions: Action[] = [];
    
    // View Details - always available
    actions.push({
        key: 'view-details',
        label: 'View Details',
        onClick: () => handlers.onViewDetails(opportunity),
    });
    
    // Edit - available if user can edit
    if (permissions?.canEdit) {
        actions.push({
            key: 'edit',
            label: 'Edit',
            onClick: () => handlers.onEdit(opportunity),
        });
    }
    
    // Update Status - available for admins
    if (permissions?.canUpdateStatus) {
        actions.push({
            key: 'update-status',
            label: 'Update Status',
            onClick: () => handlers.onUpdateStatus(opportunity),
            divider: true,
        });
    }
    
    // Delete - available if user can delete
    if (permissions?.canDelete) {
        actions.push({
            key: 'delete',
            label: 'Delete Opportunity',
            onClick: () => handlers.onDelete(opportunity),
            divider: actions.length > 1,
        });
    }
    
    return actions;
}

// Helper function to determine permissions
export function getOpportunityPermissions(
    opportunity: Opportunity,
    auth: Auth
): OpportunityActionContext['permissions'] {
    return {
        canEdit: opportunity.can_edit || auth.user.is_admin,
        canDelete: opportunity.user_id === String(auth.user.id) || auth.user.is_admin,
        canUpdateStatus: auth.user.is_admin,
        canDuplicate: auth.user.is_partner || auth.user.is_admin,
        canExport: true, // Everyone can export
        canArchive: auth.user.is_admin,
        canRestore: auth.user.is_admin,
    };
}