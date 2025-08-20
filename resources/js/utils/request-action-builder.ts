import { Action } from '@/components/ui/data-table/common/dropdown-actions';
import { OCDRequest, Auth } from '@/types';
import { RequestActionContext } from '@/types/request-actions';

interface ActionHandlers {
    onViewDetails: (request: OCDRequest) => void;
    onUpdateStatus: (request: OCDRequest) => void;
    onAddOffer: (request: OCDRequest) => void;
    onSeeOffers: (request: OCDRequest) => void;
}

export function buildRequestActions(
    context: RequestActionContext,
    handlers: ActionHandlers
): Action[] {
    const { request, auth, permissions } = context;
    const actions: Action[] = [];
    
    // View Details - available if user can view
    if (permissions?.canView) {
        actions.push({
            key: 'view-details',
            label: 'View Details',
            onClick: () => handlers.onViewDetails(request),
        });
    }
    
    // Update Status - available if user can update status
    if (permissions?.canUpdateStatus) {
        actions.push({
            key: 'update-status',
            label: 'Update Status',
            onClick: () => handlers.onUpdateStatus(request),
            divider: actions.length > 0,
        });
    }
    
    // Offer Management Actions - available if user can manage offers
    if (permissions?.canManageOffers) {
        actions.push({
            key: 'add-offer',
            label: 'Add New Offer',
            onClick: () => handlers.onAddOffer(request),
            divider: actions.length > 0,
        });
        
        actions.push({
            key: 'see-offers',
            label: 'See Request Offers',
            onClick: () => handlers.onSeeOffers(request),
        });
    }
    
    return actions;
}

// Helper function to determine permissions
export function getRequestPermissions(
    request: OCDRequest,
    auth: Auth
): RequestActionContext['permissions'] {
    return {
        canView: request.can_view,
        canUpdateStatus: request.can_update_status,
        canManageOffers: request.can_manage_offers,
        canEdit: request.can_edit || auth.user.is_admin,
        canDelete: auth.user.is_admin,
    };
}