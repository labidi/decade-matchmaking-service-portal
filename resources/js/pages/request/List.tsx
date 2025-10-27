import React from 'react';
import {Head} from '@inertiajs/react';
import { FrontendLayout } from '@layouts/index';
import {OCDRequestList, PaginationLinkProps} from '@/types';
import {RequestsDataTable} from '@ui/organisms/data-table/requests';
import {userColumns} from '@ui/organisms/data-table/requests';
import {useRequestActions} from '@features/requests/hooks';

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
    routeName: string;
    currentSearch?: Record<string, string>;
}

export default function RequestsList({
                                         requests,
                                         currentSort,
                                         routeName,
                                         currentSearch = {}
                                     }: Readonly<RequestsListPageProps>) {


    const {
        getActionsForRequest,
    } = useRequestActions('user');

    return (
        <FrontendLayout>
            <Head title="Welcome"/>
            <div>
                <RequestsDataTable
                    requests={requests.data}
                    currentSort={currentSort}
                    currentSearch={currentSearch}
                    columns={userColumns}
                    routeName={routeName}
                    getActionsForRequest={getActionsForRequest}
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
                            id: 'title',
                            type: 'text',
                            label: 'Title',
                            placeholder: 'Search by request title...'
                        }
                    ]}
                />
            </div>

        </FrontendLayout>
    );
}
