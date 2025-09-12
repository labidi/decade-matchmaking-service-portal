import React from 'react';
import {DropdownActions} from '@/components/ui/data-table/common/dropdown-actions';
import {Opportunity, Context} from '@/types';
import {useOpportunityActions} from '@/hooks/useOpportunityActions';

interface OpportunityActionsProps {
    opportunity: Opportunity;
    context: Context,
    showRouteName: string
}

export function OpportunityActions({opportunity, context, showRouteName}: Readonly<OpportunityActionsProps>) {
    const {
        getActionsForOpportunity,
    } = useOpportunityActions(context, showRouteName);

    const actions = getActionsForOpportunity(context, opportunity);

    return (
        <DropdownActions actions={actions}/>
    );
}
