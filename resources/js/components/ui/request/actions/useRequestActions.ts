import { useMemo } from 'react';
import { router } from '@inertiajs/react';
import { OCDRequest, OCDRequestStatus } from '@/types';
import { RequestAction, RequestActionsConfig } from '@/types/request-actions';
import {
    EyeIcon,
    PencilSquareIcon,
    PlusIcon,
    DocumentTextIcon,
    CheckIcon,
    QuestionMarkCircleIcon,
    MinusCircleIcon,
    DocumentArrowDownIcon,
    TrashIcon
} from '@heroicons/react/16/solid';

/**
 * Custom hook to generate request actions based on permissions and configuration
 * This provides the core business logic for request actions that can be used
 * by both the provider component and legacy implementations
 */
export function useRequestActions(
    request: OCDRequest,
    config: RequestActionsConfig = {},
    onStatusUpdate?: (request: OCDRequest) => void,
    activeOffer?: import('@/types').RequestOffer
): RequestAction[] {
    const {
        showViewDetails = true,
        showUpdateStatus = true,
        showOfferActions = true,
        showFrontendActions = false,
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
                    onClick: () => router.visit(route('admin.offer.create', { request_id: request.id })),
                    divider: actions.length > 0,
                    variant: 'success'
                },
                {
                    key: 'see-offers',
                    label: 'See Request Offers',
                    icon: DocumentTextIcon,
                    onClick: () => router.visit(route('admin.offer.list', { request: request.id })),
                    variant: 'secondary'
                }
            );
        }

        // Frontend-specific Actions - for request show page
        if (showFrontendActions && context === 'show') {
            // Accept Offer - only if there's an active offer
            if (activeOffer) {
                actions.push({
                    key: 'accept-offer',
                    label: 'Accept Offer',
                    icon: CheckIcon,
                    onClick: () => {
                        router.post(route('request.accept-offer', {
                            request: request.id,
                            offer: activeOffer.id
                        }), {}, {
                            onError: (errors) => {
                                console.error('Error accepting offer:', errors);
                            }
                        });
                    },
                    divider: actions.length > 0,
                    variant: 'success'
                });

                // Request Clarifications - only if there's an active offer
                actions.push({
                    key: 'request-clarifications',
                    label: 'Request clarifications from IOC',
                    icon: QuestionMarkCircleIcon,
                    onClick: () => {
                        router.post(route('request.request-clarifications', {
                            request: request.id,
                            offer: activeOffer.id
                        }), {}, {
                            onError: (errors) => {
                                console.error('Error requesting clarifications:', errors);
                            }
                        });
                    },
                    variant: 'secondary'
                });
            }

            // Edit Request - if user can edit
            if (request.can_edit) {
                actions.push({
                    key: 'edit',
                    label: 'Edit Request',
                    icon: PencilSquareIcon,
                    onClick: () => router.visit(route('request.edit', { id: request.id })),
                    divider: actions.length > 0,
                    variant: 'primary'
                });
            }

            // Delete Request - if user can edit (assuming same permission)
            if (request.can_edit) {
                actions.push({
                    key: 'delete',
                    label: 'Delete Request',
                    icon: TrashIcon,
                    onClick: () => {
                        if (confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
                            router.delete(route('request.destroy', { id: request.id }), {
                                onError: (errors) => {
                                    console.error('Error deleting request:', errors);
                                }
                            });
                        }
                    },
                    variant: 'danger'
                });
            }

            // Withdraw Request - if user owns the request
            if (request.user_id && request.user?.id === request.user_id) {
                actions.push({
                    key: 'withdraw',
                    label: 'Withdraw Request',
                    icon: MinusCircleIcon,
                    onClick: () => {
                        if (confirm('Are you sure you want to withdraw this request?')) {
                            router.post(route('request.withdraw', { id: request.id }), {}, {
                                onError: (errors) => {
                                    console.error('Error withdrawing request:', errors);
                                }
                            });
                        }
                    },
                    variant: 'danger'
                });
            }

            // Export PDF
            actions.push({
                key: 'export-pdf',
                label: 'Export as PDF',
                icon: DocumentArrowDownIcon,
                onClick: () => {
                    window.open(route('request.export-pdf', { id: request.id }), '_blank');
                },
                variant: 'secondary'
            });

            // View All Offers - if there are multiple offers
            if (request.offers && request.offers.length > 1) {
                actions.push({
                    key: 'view-offers',
                    label: 'View All Offers',
                    icon: DocumentTextIcon,
                    onClick: () => router.visit(route('request.offers', { id: request.id })),
                    variant: 'secondary'
                });
            }
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
        showFrontendActions,
        context,
        customActions,
        onStatusUpdate,
        activeOffer
    ]);
}
