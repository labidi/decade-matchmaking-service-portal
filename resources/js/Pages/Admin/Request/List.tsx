import React, { useState } from 'react';
import {Head, router} from '@inertiajs/react';
import {OCDRequest, OCDRequestList, PaginationLinkProps} from '@/types';
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import {RequestsDataTable} from "@/components/ui/data-table/requests/requests-data-table";
import {adminColumns} from "@/components/ui/data-table/requests/column-configs";
import {Heading} from "@/components/ui/heading";
import {UpdateStatusDialog} from "@/components/ui/dialogs/UpdateStatusDialog";


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
    availableStatuses: Array<{
        id: number;
        status_code: string;
        status_label: string;
    }>;
}

export default function RequestListPage({requests, currentSort, currentSearch = {}, availableStatuses}: Readonly<RequestsListPageProps>) {
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<OCDRequest | null>(null);

    const handleUpdateStatus = (request: OCDRequest) => {
        setSelectedRequest(request);
        setIsStatusDialogOpen(true);
    };

    const getActionsForRequest = (request: OCDRequest) => {
        const actions = [];

        // View Details - available if user can view
        if (request.can_view) {
            actions.push({
                key: 'view-details',
                label: 'View Details',
                onClick: () => router.visit(route('admin.request.show', {id: request.id}))
            });
        }

        // Update Status - available if user can update status
        if (request.can_update_status) {
            actions.push({
                key: 'update-status',
                label: 'Update Status',
                onClick: () => handleUpdateStatus(request),
                divider: actions.length > 0
            });
        }

        // Add New Offer - available if user can manage offers
        if (request.can_manage_offers) {
            actions.push({
                key: 'add-offer',
                label: 'Add New Offer',
                onClick: () => router.visit(route('admin.offers.create', {request_id: request.id})),
                divider: actions.length > 0
            });
            actions.push({
                key: 'see-offers',
                label: 'See request offers',
                onClick: () => router.visit(route('admin.offers.list', {request: request.id})),
                divider: actions.length > 0
            });
        }

        return actions;
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

            {/* Status Update Dialog */}
            <UpdateStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={() => {
                    setIsStatusDialogOpen(false);
                    setSelectedRequest(null);
                }}
                request={selectedRequest}
                availableStatuses={availableStatuses}
            />
        </SidebarLayout>
    );
}
