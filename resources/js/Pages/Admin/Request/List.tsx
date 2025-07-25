import React, {useState} from 'react';
import {Head} from '@inertiajs/react';
import {OCDRequest, OCDRequestList, PaginationLinkProps} from '@/types';

import {SidebarLayout} from '@/components/ui/sidebar/sidebar-layout'
import {Navbar} from '@/components/ui/navbar'
import {Sidebar} from '@/components/ui/sidebar'
import {SidebarContent} from '@/components/ui/sidebar/sidebar-content'
import {RequestsDataTable} from "@/components/ui/data-table/requests/requests-data-table";

interface RequestsPagination {
    current_page: number;
    data: OCDRequestList,
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

interface RequestsListPageProps {
    requests: RequestsPagination;
    currentSort: {
        field: string;
        order: string;
    };
    currentSearch?: Record<string, string>;
}

export default function RequestListPage({requests, currentSort, currentSearch = {}}: Readonly<RequestsListPageProps>) {
    return (
        <SidebarLayout
            sidebar={<Sidebar><SidebarContent/></Sidebar>}
            navbar={<Navbar></Navbar>}
        >
            <Head title="Requests List"/>
            <div className="mx-auto">
                <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Requests List
                </h2>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <div className="py-8">
                <RequestsDataTable
                    requests={requests.data}
                    currentSort={currentSort}
                    currentSearch={currentSearch}
                    pagination={{
                        current_page: requests.current_page,
                        last_page: requests.last_page,
                        links: requests.links,
                        prev_page_url: requests.prev_page_url,
                        next_page_url: requests.next_page_url,
                        from: requests.from,
                        to: requests.to,
                        total: requests.total
                    }}
                />
            </div>
        </SidebarLayout>
    );
}
