import React from 'react';
import {Head} from '@inertiajs/react';
import {OCDRequestList, PaginationLinkProps} from '@/types';

import {SidebarLayout} from '@/components/ui/sidebar/sidebar-layout'
import {Sidebar} from '@/components/ui/sidebar'
import {SidebarContent} from '@/components/ui/sidebar/sidebar-content'

import {RequestsDataTable} from "@/components/ui/data-table/requests/requests-data-table";
import {adminColumns} from "@/components/ui/data-table/requests/column-configs";
import { HomeIcon } from '@heroicons/react/20/solid'


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
    const pages = [
        { name: 'Projects', href: '#', current: false },
        { name: 'Project Nero', href: '#', current: true },
    ]
    return (
        <SidebarLayout
            sidebar={<Sidebar><SidebarContent/></Sidebar>}
            navbar={<span></span>}
        >
            <Head title="Requests List"/>
            <div className="mx-auto">
                <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    Requests List
                </h2>
                <nav aria-label="Breadcrumb" className="flex">
                    <ol role="list" className="flex items-center space-x-4">
                        <li>
                            <div>
                                <a href="#" className="text-gray-400 hover:text-gray-500">
                                    <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
                                    <span className="sr-only">Home</span>
                                </a>
                            </div>
                        </li>
                        {pages.map((page) => (
                            <li key={page.name}>
                                <div className="flex items-center">
                                    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" className="size-5 shrink-0 text-gray-300">
                                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                    </svg>
                                    <a
                                        href={page.href}
                                        aria-current={page.current ? 'page' : undefined}
                                        className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                                    >
                                        {page.name}
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ol>
                </nav>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <div className="py-8">
                <RequestsDataTable
                    requests={requests.data}
                    currentSort={currentSort}
                    currentSearch={currentSearch}
                    columns={adminColumns}
                    routeName="admin.request.list"
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
                    searchFields={[
                        {
                            key: 'user',
                            label: 'Submitted By',
                            placeholder: 'Search by user name...'
                        },
                        {
                            key: 'title',
                            label: 'Title',
                            placeholder: 'Search by request title...'
                        }
                    ]}
                    showSearch={true}
                    showActions={true}
                />
            </div>
        </SidebarLayout>
    );
}
