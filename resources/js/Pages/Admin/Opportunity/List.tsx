import React from 'react';
import { Head } from '@inertiajs/react';
import { OpportunitiesList, PaginationLinkProps } from '@/types';

import { SidebarLayout } from '@/components/ui/layouts/sidebar-layout'
import { OpportunitiesDataTable } from "@/components/ui/data-table/opportunities/opportunities-data-table";
import { OpportunityStatusDialog } from '@/components/features/opportunity';
import { adminColumns } from "@/components/ui/data-table/opportunities/column-configs";
import { Heading } from "@/components/ui/heading";
import { useOpportunityActions } from '@/hooks/useOpportunityActions';

interface OpportunitiesPagination {
    current_page: number;
    data: OpportunitiesList,
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLinkProps[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface OpportunitiesListPageProps {
    opportunities: OpportunitiesPagination;
    currentSort: {
        field: string;
        order: string;
    };
    currentSearch?: Record<string, string>;
}

export default function OpportunityListPage({
    opportunities,
    currentSort,
    currentSearch,
}: Readonly<OpportunitiesListPageProps>) {
    const {
        isStatusDialogOpen,
        selectedOpportunity,
        closeStatusDialog,
        getActionsForOpportunity,
    } = useOpportunityActions();

    return (
        <SidebarLayout>
            <Head title="Opportunities List"/>
            <div className="mx-auto">
                <Heading level={1}>
                    Opportunities List
                </Heading>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <div className="py-8">
                <OpportunitiesDataTable
                    opportunities={opportunities.data}
                    currentSort={currentSort}
                    currentSearch={currentSearch}
                    columns={adminColumns}
                    routeName="admin.opportunity.list"
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
                            id: 'user',
                            type: 'text',
                            label: 'Submitted By',
                            placeholder: 'Search by user name...'
                        },
                        {
                            id: 'title',
                            type: 'text',
                            label: 'Title',
                            placeholder: 'Search by opportunity title...'
                        }
                    ]}
                    showSearch={true}
                    showActions={true}
                />
            </div>

            {/* Single Status Update Dialog for the entire page */}
            <OpportunityStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={closeStatusDialog}
                opportunity={selectedOpportunity}
            />
        </SidebarLayout>
    );
}
