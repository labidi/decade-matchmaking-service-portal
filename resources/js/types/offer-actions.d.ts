import { RequestOffer } from '@/types';
import { Action } from '@/components/ui/data-table/common/dropdown-actions';

// Hook return type
export interface UseOfferActionsReturn {
    // State
    isStatusDialogOpen: boolean;
    selectedOffer: RequestOffer | null;
    isLoading: boolean;
    availableStatuses: Array<{ value: string; label: string }>;

    // Actions
    closeStatusDialog: () => void;
    getActionsForOffer: (
        offer: RequestOffer,
        customAvailableStatuses?: Array<{ value: string; label: string }>
    ) => Action[];
}