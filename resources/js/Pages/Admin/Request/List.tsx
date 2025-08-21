import React from 'react';
import {Head} from '@inertiajs/react';
import {OCDRequestList, PaginationLinkProps, OCDRequestStatus} from '@/types';
import { SidebarLayout } from '@/components/ui/layouts/sidebar-layout'
import { RequestsDataTable } from "@/components/ui/data-table/requests/requests-data-table";
import { adminColumns } from "@/components/ui/data-table/requests/column-configs";
import { Heading } from "@/components/ui/heading";
import { useRequestActions } from '@/hooks/useRequestActions';
import { UpdateStatusDialog } from '@/components/ui/dialogs/UpdateStatusDialog';


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
    availableStatuses: OCDRequestStatus[];
}


export default function RequestListPage({requests, currentSort, currentSearch = {}, availableStatuses}: Readonly<RequestsListPageProps>) {
    const {
        isStatusDialogOpen,
        selectedRequest,
        closeStatusDialog,
        getActionsForRequest,
        availableStatuses: dialogStatuses,
    } = useRequestActions('admin');

    return (
        <SidebarLayout>
            <Head title="Requests List"/>
            <div className="mx-auto">
                <Heading level={1}>
                    Requests List
                </Heading>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <div className="py-8">
                <RequestsDataTable
                    requests={requests.data}
                    currentSort={currentSort}
                    currentSearch={currentSearch}
                    columns={adminColumns}
                    routeName="admin.request.list"
                    getActionsForRequest={(request) => getActionsForRequest(request, availableStatuses)}
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
                            id: 'user',
                            type: 'text',
                            label: 'Submitted By',
                            placeholder: 'Search by user name...'
                        },
                        {
                            id: 'title',
                            type: 'text',
                            label: 'Title',
                            placeholder: 'Search by request title...'
                        }
                    ]}
                    showSearch={true}
                    showActions={true}
                />
            </div>
            <UpdateStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={closeStatusDialog}
                request={selectedRequest}
                availableStatuses={dialogStatuses.length > 0 ? dialogStatuses : availableStatuses}
            />
        </SidebarLayout>
    );
}
