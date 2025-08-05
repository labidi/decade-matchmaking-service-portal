import { useMemo } from 'react';
import { router } from '@inertiajs/react';
import { OCDRequest, RequestStatus } from '@/types';
import { RequestAction, RequestActionsConfig } from '@/types/request-actions';
import {
    EyeIcon,
    PencilSquareIcon,
    PlusIcon,
    DocumentTextIcon
} from '@heroicons/react/16/solid';

/**
 * Custom hook to generate request actions based on permissions and configuration
 * This provides the core business logic for request actions that can be used
 * by both the provider component and legacy implementations
 */
export function useRequestActions(
    request: OCDRequest,
    config: RequestActionsConfig = {},
    onStatusUpdate?: (request: OCDRequest) => void
): RequestAction[] {
    const {
        showViewDetails = true,
        showUpdateStatus = true,
        showOfferActions = true,
        context = 'list',
        customActions = []
    } = config;

    return useMemo((): RequestAction[] => {
        const actions: RequestAction[] = [];

        // View Details - available if user can view and context allows it
        if (request.can_view && showViewDetails && context !== 'show') {
            actions.push({
                key: 'view-details',
                label: 'View Details',
                icon: EyeIcon,
                onClick: () => router.visit(route('admin.request.show', { id: request.id })),
                variant: 'secondary'
            });
        }

        // Update Status - available if user can update status
        if (request.can_update_status && showUpdateStatus) {
            actions.push({
                key: 'update-status',
                label: 'Update Status',
                icon: PencilSquareIcon,
                onClick: () => {
                    if (onStatusUpdate) {
                        onStatusUpdate(request);
                    }
                },
                divider: actions.length > 0,
                variant: 'primary'
            });
        }

        // Offer Management Actions - available if user can manage offers
        if (request.can_manage_offers && showOfferActions) {
            actions.push(
                {
                    key: 'add-offer',
                    label: 'Add New Offer',
                    icon: PlusIcon,
                    onClick: () => router.visit(route('admin.offers.create', { request_id: request.id })),
                    divider: actions.length > 0,
                    variant: 'success'
                },
                {
                    key: 'see-offers',
                    label: 'See Request Offers',
                    icon: DocumentTextIcon,
                    onClick: () => router.visit(route('admin.offers.list', { request: request.id })),
                    variant: 'secondary'
                }
            );
        }

        // Add custom actions
        if (customActions.length > 0) {
            actions.push(
                ...customActions.map(action => ({
                    ...action,
                    divider: action.divider ?? (actions.length > 0)
                }))
            );
        }

        return actions;
    }, [
        request,
        showViewDetails,
        showUpdateStatus,
        showOfferActions,
        context,
        customActions,
        onStatusUpdate
    ]);
}
