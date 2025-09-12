import React from 'react';
import {Head} from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import {PageProps, OpportunitiesPagination} from '@/types';
import {OpportunitiesDataTable} from '@/components/ui/data-table/opportunities/opportunities-data-table';
import {partnerColumns} from '@/components/ui/data-table/opportunities/column-configs';
import {useOpportunityActions} from '@/hooks/useOpportunityActions';

interface OpportunitiesListPageProps extends PageProps<{
    opportunities: OpportunitiesPagination;
    currentSort: {
        field: string;
        order: string;
    };
    listRouteName: string;
    showRouteName: string;
    currentSearch?: Record<string, string>;
    context: 'user_own' | 'admin' | 'public';
    searchFieldsOptions?: {
        types?: { value: string; label: string }[];
        statuses?: { value: string; label: string }[];
    }
}> {
}

export default function OpportunitiesListPage({
                                                  opportunities,
                                                  currentSort,
                                                  listRouteName,
                                                  showRouteName,
                                                  currentSearch = {},
                                                  searchFieldsOptions,
                                                  context,
                                                  auth
                                              }: Readonly<OpportunitiesListPageProps>) {

    const {
        getActionsForOpportunity,
    } = useOpportunityActions(context, showRouteName);
    return (
        <FrontendLayout>
            <Head title="My Opportunities"/>
            <OpportunitiesDataTable
                opportunities={opportunities.data}
                currentSort={currentSort}
                currentSearch={currentSearch}
                columns={partnerColumns}
                routeName={listRouteName}
                getActionsForOpportunity={getActionsForOpportunity}
                pagination={{
                    current_page: opportunities.current_page,
                    last_page: opportunities.last_page,
                    links: opportunities.links,
                    prev_page_url: opportunities.prev_page_url,
                    next_page_url: opportunities.next_page_url,
                    from: opportunities.from,
                    to: opportunities.to,
                    total: opportunities.total
                }}
                searchFields={[
                    {
                        id: 'title',
                        type: 'text',
                        label: 'Title',
                        placeholder: 'Search by opportunity title...'
                    },
                    {
                        id: 'type',
                        type: 'select',
                        label: 'Type',
                        placeholder: 'Filter by type...',
                        options: searchFieldsOptions?.types || []
                    },
                    {
                        id: 'status',
                        type: 'select',
                        label: 'Status',
                        placeholder: 'Filter by status...',
                        options: searchFieldsOptions?.statuses || []
                    }
                ]}
                showSearch={true}
                showActions={true}
            />

        </FrontendLayout>
    )
}
