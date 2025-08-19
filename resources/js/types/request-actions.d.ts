import { OCDRequest, OCDRequestStatus } from '@/types';

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
