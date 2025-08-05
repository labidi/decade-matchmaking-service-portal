import React, { useState } from 'react';
import {Head} from '@inertiajs/react';
import {OCDRequest, OCDRequestList, PaginationLinkProps, RequestStatus} from '@/types';
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import {RequestsDataTable} from "@/components/ui/data-table/requests/requests-data-table";
import {adminColumns} from "@/components/ui/data-table/requests/column-configs";
import {Heading} from "@/components/ui/heading";
import { buildRequestActions } from '@/components/ui/data-table/requests/requests-actions-columns';
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
    availableStatuses: RequestStatus[];
}

export default function RequestListPage({requests, currentSort, currentSearch = {}, availableStatuses}: Readonly<RequestsListPageProps>) {
    // Dialog state management for UpdateStatusDialog
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<OCDRequest | null>(null);

    // Handle status update dialog opening
    const handleUpdateStatus = (request: OCDRequest) => {
        setSelectedRequest(request);
        setIsStatusDialogOpen(true);
    };

    // Handle dialog closing
    const handleCloseDialog = () => {
        setIsStatusDialogOpen(false);
        setSelectedRequest(null);
    };

    // Build actions for each request - now includes status update functionality
    const getActionsForRequest = (request: OCDRequest) => {
        return buildRequestActions(request, handleUpdateStatus, true);
    };
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

            {/* UpdateStatusDialog - Single dialog for all rows */}
            <UpdateStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={handleCloseDialog}
                request={selectedRequest}
                availableStatuses={availableStatuses}
            />
        </SidebarLayout>
    );
}
