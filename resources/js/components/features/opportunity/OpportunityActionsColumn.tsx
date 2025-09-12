import React from 'react';
import {DropdownActions} from '@/components/ui/data-table/common/dropdown-actions';
import {Opportunity} from '@/types';
import {useOpportunityActions} from '@/hooks/useOpportunityActions';

interface OpportunityActionsProps {
    opportunity: Opportunity;
    context: string,
    showRouteName: string
}

export function OpportunityActions({opportunity, context, showRouteName}: Readonly<OpportunityActionsProps>) {
    const {
        getActionsForOpportunity,
    } = useOpportunityActions(context, showRouteName);

    const actions = getActionsForOpportunity(opportunity);

    return (
        <DropdownActions actions={actions}/>
    );
}
