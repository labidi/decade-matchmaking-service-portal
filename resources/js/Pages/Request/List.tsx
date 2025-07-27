import React, {useState} from 'react';
import {Head} from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import {OCDRequestList, PaginationLinkProps} from '@/types';
import {RequestsDataTable} from "@/components/ui/data-table/requests/requests-data-table";
import {userColumns} from "@/components/ui/data-table/requests/column-configs";

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

export default function RequestsList({requests, currentSort, currentSearch = {}}: Readonly<RequestsListPageProps>) {
    return (
        <FrontendLayout>
            <Head title="Welcome"/>
            <div>

                <RequestsDataTable
                    requests={requests.data}
                    currentSort={currentSort}
                    currentSearch={currentSearch}
                    columns={userColumns}
                    routeName="request.me.list"
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
                />
            </div>

        </FrontendLayout>
    );
}
