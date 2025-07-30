import React from 'react';
import {Head, router} from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import {OCDRequestList, PaginationLinkProps, OCDRequest} from '@/types';
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
    routeName: string;
    currentSearch?: Record<string, string>;
}

export default function RequestsList({
                                         requests,
                                         currentSort,
                                         routeName,
                                         currentSearch = {}
                                     }: Readonly<RequestsListPageProps>) {

    // Action functions for RequestsDataTable
    const handleUpdateStatus = (request: OCDRequest) => {
        // Navigate to the request edit page for status updates
        router.visit(route('request.edit', {id: request.id}));
    };

    const handleSeeActiveOffer = (request: OCDRequest) => {
        // Navigate to request details page to see the active offer
        router.visit(route('request.show', {id: request.id}));
    };

    // Dynamic actions based on request permissions
    const getActionsForRequest = (request: OCDRequest) => {
        const actions = [];

        // View Details - available if user can view
        if (request.can_view) {
            actions.push({
                key: 'view-details',
                label: 'View Details',
                onClick: () => router.visit(route('request.show', {id: request.id}))
            });
        }

        // Edit - available if user can edit
        if (request.can_edit) {
            actions.push({
                key: 'edit',
                label: 'Edit',
                onClick: () => router.visit(route('request.edit', {id: request.id}))
            });
        }

        // See Active Offer - available if request has active offer and user can view
        if (request.active_offer && request.can_view) {
            actions.push({
                key: 'see-active-offer',
                label: 'See Active Offer',
                onClick: () => handleSeeActiveOffer(request),
                divider: actions.length > 0
            });
        }

        return actions;
    };

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
