import { Opportunity, Auth } from './index';
import { Action } from '@/components/ui/data-table/common/dropdown-actions';

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


// Hook return type
export interface UseOpportunityActionsReturn {
    getActionsForOpportunity: (
        opportunity: Opportunity,
        customPermissions?: OpportunityActionContext['permissions']
    ) => Action[];
}
