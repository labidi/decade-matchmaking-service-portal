import React from 'react';
import {Head, router} from '@inertiajs/react';
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import {RequestOfferList, PaginationLinkProps, RequestOffer} from '@/types';
import {OffersDataTable} from "@/components/ui/data-table/offers/offers-data-table";
import {Button} from '@/components/ui/button';
import {PlusIcon} from '@heroicons/react/16/solid';
import {Heading} from "@/components/ui/heading";
import {useOfferActions} from '@/hooks/useOfferActions';

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
    // Use the new offer actions hook
    const {
        getActionsForOffer,
    } = useOfferActions('admin');

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
