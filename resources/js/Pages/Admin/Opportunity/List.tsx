import React from 'react';
import {Head} from '@inertiajs/react';
import {OpportunitiesPagination , Context} from '@/types';
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import {OpportunitiesDataTable} from "@/components/ui/data-table/opportunities/opportunities-data-table";
import {adminColumns} from "@/components/ui/data-table/opportunities/column-configs";
import {Heading} from "@/components/ui/heading";
import {useOpportunityActions} from '@/hooks/useOpportunityActions';


interface OpportunitiesListPageProps {
    opportunities: OpportunitiesPagination;
    currentSort: {
        field: string;
        order: string;
    };
    currentSearch?: Record<string, string>;
    context: Context,
    showRouteName: string

}

export default function OpportunityListPage({
                                                opportunities,
                                                currentSort,
                                                currentSearch,
                                                context,
                                                showRouteName
                                            }: Readonly<OpportunitiesListPageProps>) {
    const {
        getActionsForOpportunity,
    } = useOpportunityActions(context, showRouteName);

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
                    context={context}
                />
            </div>

        </SidebarLayout>
    );
}
