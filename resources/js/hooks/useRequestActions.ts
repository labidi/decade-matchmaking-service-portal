import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { OCDRequest, Auth, OCDRequestStatus } from '@/types';
import { Action } from '@/components/ui/data-table/common/dropdown-actions';
import { 
    RequestActionContext,
    UseRequestActionsReturn 
} from '@/types/request-actions';
import { buildRequestActions } from '@/utils/request-action-builder';

export function useRequestActions(): UseRequestActionsReturn {
    const { auth } = usePage<{ auth: Auth }>().props;
    
    // Dialog state management
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<OCDRequest | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [availableStatuses, setAvailableStatuses] = useState<OCDRequestStatus[]>([]);
    
    // Action handlers
    const handleViewDetails = useCallback((request: OCDRequest) => {
        router.visit(route('admin.request.show', { id: request.id }));
    }, []);
    
    const handleUpdateStatus = useCallback((request: OCDRequest, statuses: OCDRequestStatus[] = []) => {
        setSelectedRequest(request);
        setAvailableStatuses(statuses);
        setIsStatusDialogOpen(true);
    }, []);
    
    const handleAddOffer = useCallback((request: OCDRequest) => {
        router.visit(route('admin.offer.create', { request_id: request.id }));
    }, []);
    
    const handleSeeOffers = useCallback((request: OCDRequest) => {
        router.visit(route('admin.offer.list', { id: request.id }));
    }, []);
    
    // Dialog actions
    const closeStatusDialog = useCallback(() => {
        setIsStatusDialogOpen(false);
        setSelectedRequest(null);
        setAvailableStatuses([]);
    }, []);
    
    // Build actions for a specific request
    const getActionsForRequest = useCallback((
        request: OCDRequest,
        customPermissions?: RequestActionContext['permissions'],
        customAvailableStatuses?: OCDRequestStatus[]
    ): Action[] => {
        const context: RequestActionContext = {
            request,
            auth,
            permissions: customPermissions || {
                canView: request.can_view,
                canUpdateStatus: request.can_update_status,
                canManageOffers: request.can_manage_offers,
            }
        };
        
        return buildRequestActions(context, {
            onViewDetails: handleViewDetails,
            onUpdateStatus: (req) => handleUpdateStatus(req, customAvailableStatuses || []),
            onAddOffer: handleAddOffer,
            onSeeOffers: handleSeeOffers,
        });
    }, [auth, handleViewDetails, handleUpdateStatus, handleAddOffer, handleSeeOffers]);
    
    return {
        // State
        isStatusDialogOpen,
        selectedRequest,
        isLoading,
        availableStatuses,
        
        // Actions
        closeStatusDialog,
        getActionsForRequest,
        
        // Direct handlers (if needed)
        handleUpdateStatus,
        handleViewDetails,
        handleAddOffer,
        handleSeeOffers,
    };
}