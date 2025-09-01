import React from 'react';
import {DropdownActions} from '@/components/ui/data-table/common/dropdown-actions';
import {Opportunity} from '@/types';
import {useOpportunityActions} from '@/hooks/useOpportunityActions';

interface OpportunityActionsProps {
    opportunity: Opportunity;
}

export function OpportunityActions({opportunity}: Readonly<OpportunityActionsProps>) {
    const {
        getActionsForOpportunity,
    } = useOpportunityActions();

    const actions = getActionsForOpportunity(opportunity);

    return (
        <DropdownActions actions={actions}/>
    );
}
