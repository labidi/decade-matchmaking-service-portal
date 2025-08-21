import { OCDRequest, OCDRequestStatus, Auth } from '@/types';
import { Action } from '@/components/ui/data-table/common/dropdown-actions';

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
