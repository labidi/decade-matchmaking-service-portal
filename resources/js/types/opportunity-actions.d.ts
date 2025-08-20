import { Opportunity, Auth } from './index';
import { Action } from '@/components/ui/data-table/common/dropdown-actions';

// Base action interface extending the existing Action interface
export interface OpportunityAction {
    key: string;
    label: string;
    onClick: () => void;
    divider?: boolean;
    disabled?: boolean;
    icon?: React.ComponentType<{ className?: string; 'data-slot'?: string }>;
    variant?: 'default' | 'destructive' | 'primary';
}

// Action types that can be performed on opportunities
export type OpportunityActionType = 
    | 'view-details'
    | 'edit'
    | 'update-status'
    | 'delete'
    | 'duplicate'
    | 'export'
    | 'archive'
    | 'restore';

// Permission context for building actions
export interface OpportunityActionContext {
    opportunity: Opportunity;
    auth: Auth;
    permissions?: {
        canEdit?: boolean;
        canDelete?: boolean;
        canUpdateStatus?: boolean;
        canDuplicate?: boolean;
        canExport?: boolean;
        canArchive?: boolean;
        canRestore?: boolean;
    };
}

// Action builder configuration
export interface OpportunityActionConfig {
    type: OpportunityActionType;
    enabled: boolean;
    condition?: (context: OpportunityActionContext) => boolean;
    customLabel?: string;
    customIcon?: React.ComponentType<{ className?: string; 'data-slot'?: string }>;
    variant?: 'default' | 'destructive' | 'primary';
}

// Handler function type for each action
export type OpportunityActionHandler = (
    opportunity: Opportunity,
    context?: OpportunityActionContext
) => void | Promise<void>;

// Action handlers map
export interface OpportunityActionHandlers {
    'view-details': OpportunityActionHandler;
    'edit': OpportunityActionHandler;
    'update-status': OpportunityActionHandler;
    'delete': OpportunityActionHandler;
    'duplicate': OpportunityActionHandler;
    'export': OpportunityActionHandler;
    'archive': OpportunityActionHandler;
    'restore': OpportunityActionHandler;
}

// State for the hook
export interface OpportunityActionsState {
    isStatusDialogOpen: boolean;
    selectedOpportunity: Opportunity | null;
    isLoading: boolean;
    lastAction: OpportunityActionType | null;
}

// Hook return type
export interface UseOpportunityActionsReturn {
    // State
    isStatusDialogOpen: boolean;
    selectedOpportunity: Opportunity | null;
    isLoading: boolean;
    
    // Actions
    closeStatusDialog: () => void;
    getActionsForOpportunity: (
        opportunity: Opportunity,
        customPermissions?: OpportunityActionContext['permissions']
    ) => Action[];
    
    // Direct handlers (optional, for custom usage)
    handleDelete: (opportunity: Opportunity) => void;
    handleUpdateStatus: (opportunity: Opportunity) => void;
}