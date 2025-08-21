import { OCDRequest, OCDRequestStatus, Auth } from '@/types';
import { Action } from '@/components/ui/data-table/common/dropdown-actions';

export interface RequestAction {
    key: string;
    label: string;
    onClick: () => void;
    divider?: boolean;
    className?: string;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    icon?: React.ComponentType<{ className?: string }>;
}

export interface RequestActionsConfig {
    /** Whether to show the "View Details" action */
    showViewDetails?: boolean;
    /** Whether to show the "Update Status" action */
    showUpdateStatus?: boolean;
    /** Whether to show offer-related actions */
    showOfferActions?: boolean;
    /** Whether to show frontend-specific actions (accept offer, request clarifications, etc.) */
    showFrontendActions?: boolean;
    /** Custom context for action generation */
    context?: 'list' | 'show' | 'modal';
    /** Additional custom actions to include */
    customActions?: RequestAction[];
}

// Permission context for building actions
export interface RequestActionContext {
    request: OCDRequest;
    auth: Auth;
    permissions?: {
        can_view?: boolean;
        canUpdateStatus?: boolean;
        canManageOffers?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
        canDuplicate?: boolean;
        canExport?: boolean;
    };
}

// Hook return type
export interface UseRequestActionsReturn {
    // State
    isStatusDialogOpen: boolean;
    selectedRequest: OCDRequest | null;
    isLoading: boolean;
    availableStatuses: OCDRequestStatus[];

    // Actions
    closeStatusDialog: () => void;
    getActionsForRequest: (
        request: OCDRequest,
        customAvailableStatuses?: OCDRequestStatus[]
    ) => Action[];
}
