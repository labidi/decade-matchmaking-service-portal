import React from 'react';
import {Head, Link} from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import {PageProps, OpportunitiesPagination} from '@/types';
import {OpportunitiesDataTable} from '@/components/ui/data-table/opportunities/opportunities-data-table';
import {partnerColumns} from '@/components/ui/data-table/opportunities/column-configs';
import { useOpportunityActions } from '@/hooks/useOpportunityActions';
import { OpportunityStatusDialog } from '@/components/features/opportunity';

export type OpportunitiesListPageActions = {
    canExportCSV?: boolean;
    canSubmitNew?: boolean;
}

interface OpportunitiesListPageProps extends PageProps<{
    opportunities: OpportunitiesPagination;
    pageActions: OpportunitiesListPageActions;
    currentSort: {
        field: string;
        order: string;
    };
    routeName: string;
    currentSearch?: Record<string, string>;
    searchFieldsOptions?: {
        types?: { value: string; label: string }[];
        statuses?: { value: string; label: string }[];
    }
}> {
}

export default function OpportunitiesListPage({
                                                  opportunities,
                                                  pageActions,
                                                  currentSort,
                                                  routeName,
                                                  currentSearch = {},
                                                  searchFieldsOptions,
                                                  auth
                                              }: Readonly<OpportunitiesListPageProps>) {

    const {
        isStatusDialogOpen,
        selectedOpportunity,
        closeStatusDialog,
        getActionsForOpportunity,
    } = useOpportunityActions();
    return (
        <FrontendLayout>
            <Head title="My Opportunities"/>
            <div className="flex justify-between items-center mb-6">
                {auth.user.is_partner && pageActions.canSubmitNew && (
                    <Link
                        href={route('opportunity.create')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                        </svg>
                        Submit New Opportunity
                    </Link>
                )}
            </div>

            <OpportunitiesDataTable
                opportunities={opportunities.data}
                currentSort={currentSort}
                currentSearch={currentSearch}
                columns={partnerColumns}
                routeName={routeName}
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

            <OpportunityStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={closeStatusDialog}
                opportunity={selectedOpportunity}
            />
        </FrontendLayout>
    )
}
