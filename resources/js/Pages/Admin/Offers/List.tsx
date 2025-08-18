import React from 'react';
import {Head, router} from '@inertiajs/react';
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import {RequestOfferList, PaginationLinkProps, RequestOffer} from '@/types';
import {OffersDataTable} from "@/components/ui/data-table/offers/offers-data-table";
import {Button} from '@/components/ui/button';
import {PlusIcon} from '@heroicons/react/16/solid';
import {Heading} from "@/components/ui/heading";

interface OffersPagination {
    current_page: number;
    data: RequestOfferList,
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

interface OffersListPageProps {
    offers: OffersPagination;
    currentSort: {
        field: string;
        order: string;
    };
    routeName: string;
    currentSearch?: Record<string, string>;
    searchFieldsOptions?: {
        requests?: { value: string; label: string }[];
    }
}

export default function OffersList({
                                       offers,
                                       currentSort,
                                       routeName,
                                       currentSearch = {},
                                       searchFieldsOptions = {}
                                   }: Readonly<OffersListPageProps>) {
    // Dynamic actions based on offer permissions
    const getActionsForOffer = (offer: RequestOffer) => {
        const actions = [];

        // View Details - available if user can view
        actions.push({
            key: 'view-details',
            label: 'View Details',
            onClick: () => router.visit(route('admin.offer.show', {id: offer.id}))
        });

        // Edit - available if user can edit
        if (offer.can_edit) {
            actions.push({
                key: 'edit',
                label: 'Edit',
                onClick: () => router.visit(route('admin.offer.edit', {id: offer.id}))
            });
        }
        // Edit - available if user can edit
        if (offer.status == 2) {
            actions.push({
                key: 'update-status',
                label: 'Enable',
                onClick: () => router.post(route('admin.offer.update-status', {id: offer.id}), {
                    status: 1
                })
            });
        }

        // Edit - available if user can edit
        if (offer.status == 1) {
            actions.push({
                key: 'update-status',
                label: 'Disable',
                onClick: () => router.post(route('admin.offer.update-status', {id: offer.id}), {
                    status: 2
                })
            });
        }

        // View Request - available if user can view the offer
        if (offer.request) {
            actions.push({
                key: 'view-request',
                label: 'View Request',
                onClick: () => router.visit(route('request.show', {id: offer.request_id})),
                divider: actions.length > 0
            });
        }


        // Delete - available if user can delete
        if (offer.can_delete) {
            actions.push({
                key: 'delete',
                label: 'Delete',
                onClick: () => handleDeleteOffer(offer),
                divider: actions.length > 0,
                className: 'text-red-600 hover:text-red-700'
            });
        }

        return actions;
    };

    const handleDeleteOffer = (offer: RequestOffer) => {
        if (confirm(`Are you sure you want to delete this offer? This action cannot be undone.`)) {
            router.delete(route('admin.offer.destroy', {id: offer.id}), {
                onSuccess: () => {
                    // Success message will be handled by the backend
                },
                onError: (errors) => {
                    console.error('Failed to delete offer:', errors);
                }
            });
        }
    };

    return (
        <SidebarLayout>
            <Head title="Manage Offers"/>

            <div className="space-y-6">
                {/* Header */}
                <div className="mx-auto">
                    <Heading level={1}>
                        Manage Offers
                    </Heading>
                    <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            View and manage all capacity development offers
                        </p>
                    </div>
                    <Button href={route('admin.offer.create')}>
                        <PlusIcon data-slot="icon"/>
                        Create New Offer
                    </Button>
                </div>

                {/* Data Table */}
                <div className="">
                    <OffersDataTable
                        offers={offers.data}
                        currentSort={currentSort}
                        currentSearch={currentSearch}
                        routeName={routeName}
                        getActionsForOffer={getActionsForOffer}
                        pagination={{
                            current_page: offers.current_page,
                            last_page: offers.last_page,
                            links: offers.links,
                            prev_page_url: offers.prev_page_url,
                            next_page_url: offers.next_page_url,
                            from: offers.from,
                            to: offers.to,
                            total: offers.total
                        }}
                        searchFields={[
                            {
                                id: 'description',
                                type: 'text',
                                label: 'Description',
                                placeholder: 'Search by offer description...'
                            },
                            {
                                id: 'partner',
                                type: 'text',
                                label: 'Partner',
                                placeholder: 'Search by partner name...'
                            },
                            {
                                id: 'request',
                                label: 'Request',
                                placeholder: 'Search by request title...',
                                type: 'select',
                                options: searchFieldsOptions.requests || []
                            }
                        ]}
                    />
                </div>
            </div>
        </SidebarLayout>
    );
}
