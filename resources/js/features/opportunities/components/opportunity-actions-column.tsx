import React from 'react';
import {DropdownActions} from '@ui/organisms/data-table/common';
import {Context} from '@/types';
import {Opportunity} from '../types/opportunity.types';
import {useOpportunityActions} from '../hooks/use-opportunity-actions';

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
