import React from 'react';
import { DropdownActions } from '@/components/ui/data-table/common/dropdown-actions';
import { Opportunity } from '@/types';
import { OpportunityStatusDialog } from '@/components/features/opportunity';
import { useOpportunityActions } from '@/hooks/useOpportunityActions';

interface OpportunityActionsProps {
    opportunity: Opportunity;
}

export function OpportunityActions({ opportunity }: Readonly<OpportunityActionsProps>) {
    const {
        isStatusDialogOpen,
        selectedOpportunity,
        closeStatusDialog,
        getActionsForOpportunity,
    } = useOpportunityActions();
    
    const actions = getActionsForOpportunity(opportunity);
    
    return (
        <>
            <DropdownActions actions={actions} />
            
            <OpportunityStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={closeStatusDialog}
                opportunity={selectedOpportunity}
            />
        </>
    );
}
