import React from 'react';
import {Head} from '@inertiajs/react';
import {OCDOpportunitiesList, PaginationLinkProps} from '@/types';

import {SidebarLayout} from '@/components/ui/sidebar/sidebar-layout'
import {Navbar} from '@/components/ui/navbar'
import {Sidebar} from '@/components/ui/sidebar'
import {SidebarContent} from '@/components/ui/sidebar/sidebar-content'
import {OpportunitiesDataTable} from "@/components/ui/data-table/opportunities/opportunities-data-table";

interface OpportunitiesPagination {
    current_page: number;
    data: OCDOpportunitiesList,
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
}

export default function OpportunityListPage({opportunities, currentSort}: Readonly<OpportunitiesListPageProps>) {
    return (
        <SidebarLayout
            sidebar={<Sidebar><SidebarContent/></Sidebar>}
            navbar={<Navbar></Navbar>}
        >
            <Head title="Opportunities List"/>
            <div className="mx-auto">
                <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Opportunities List
                </h2>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <div className="py-8">
                <OpportunitiesDataTable
                    opportunities={opportunities.data}
                    currentSort={currentSort}
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
                />
            </div>
        </SidebarLayout>
    );
}