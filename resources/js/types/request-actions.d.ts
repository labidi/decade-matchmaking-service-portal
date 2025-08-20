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
    /** Custom context for action generation */
    context?: 'list' | 'show' | 'modal';
    /** Additional custom actions to include */
    customActions?: RequestAction[];
}

export interface RequestActionsProviderProps {
    request: OCDRequest;
    config?: RequestActionsConfig;
    availableStatuses?: OCDRequestStatus[];
    onStatusUpdate?: (request: OCDRequest) => void;
    children: (actions: RequestAction[]) => React.ReactNode;
}

export interface RequestActionButtonsProps {
    request: OCDRequest;
    config?: RequestActionsConfig;
    availableStatuses?: OCDRequestStatus[];
    onStatusUpdate?: (request: OCDRequest) => void;
    layout?: 'horizontal' | 'vertical' | 'dropdown';
    className?: string;
    buttonSize?: 'sm' | 'md' | 'lg';
}

// Action types that can be performed on requests
export type RequestActionType = 
    | 'view-details'
    | 'update-status'
    | 'add-offer'
    | 'see-offers'
    | 'edit'
    | 'delete'
    | 'duplicate'
    | 'export';

// Permission context for building actions
export interface RequestActionContext {
    request: OCDRequest;
    auth: Auth;
    permissions?: {
        canView?: boolean;
        canUpdateStatus?: boolean;
        canManageOffers?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
        canDuplicate?: boolean;
        canExport?: boolean;
    };
}

// Handler function type for each action
export type RequestActionHandler = (
    request: OCDRequest,
    context?: RequestActionContext
) => void | Promise<void>;

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
        customPermissions?: RequestActionContext['permissions'],
        customAvailableStatuses?: OCDRequestStatus[]
    ) => Action[];
    
    // Direct handlers (optional, for custom usage)
    handleUpdateStatus: (request: OCDRequest, statuses?: OCDRequestStatus[]) => void;
    handleViewDetails: (request: OCDRequest) => void;
    handleAddOffer: (request: OCDRequest) => void;
    handleSeeOffers: (request: OCDRequest) => void;
}
