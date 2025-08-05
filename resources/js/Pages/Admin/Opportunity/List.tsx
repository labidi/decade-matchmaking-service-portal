import React, { useState } from 'react';
import {Head, router} from '@inertiajs/react';
import {OCDOpportunity, OCDOpportunitiesList, PaginationLinkProps} from '@/types';

import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import {OpportunitiesDataTable} from "@/components/ui/data-table/opportunities/opportunities-data-table";
import { OpportunityStatusDialog } from '@/components/ui/dialogs/OpportunityStatusDialog';
import {adminColumns} from "@/components/ui/data-table/opportunities/column-configs";
import {Heading} from "@/components/ui/heading";
import { buildOpportunityActions } from '@/components/ui/data-table/opportunities/opportunities-actions-column';

interface OpportunitiesPagination {
    current_page: number;
    data: OCDOpportunitiesList,
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

interface OpportunitiesListPageProps {
    opportunities: OpportunitiesPagination;
    currentSort: {
        field: string;
        order: string;
    };
    currentSearch?: Record<string, string>;
    canUpdateStatus?: boolean;
    canDelete?: boolean;
}

export default function OpportunityListPage({
    opportunities,
    currentSort,
    currentSearch,
    canUpdateStatus = true, // Admins can update status by default
    canDelete = true // Admins can delete by default
}: Readonly<OpportunitiesListPageProps>) {
    // Single dialog state for the entire page
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState<OCDOpportunity | null>(null);

    const handleUpdateStatus = (opportunity: OCDOpportunity) => {
        setSelectedOpportunity(opportunity);
        setIsStatusDialogOpen(true);
    };

    const handleDelete = (opportunity: OCDOpportunity) => {
        if (!confirm('Are you sure you want to delete this opportunity?')) {
            return;
        }

        router.delete(route('partner.opportunity.destroy', {id: opportunity.id}), {
            onSuccess: () => {
                // Opportunity will be removed from list automatically by Inertia
            },
            onError: (errors) => {
                console.error('Failed to delete opportunity:', errors);
                alert('Failed to delete opportunity. Please try again.');
            }
        });
    };

    const handleCloseDialog = () => {
        setIsStatusDialogOpen(false);
        setSelectedOpportunity(null);
    };

    // Build actions for each opportunity - following the same pattern as requests
    const getActionsForOpportunity = (opportunity: OCDOpportunity) => {
        return buildOpportunityActions(
            opportunity,
            handleUpdateStatus,
            handleDelete,
            true, // showViewDetails
            canUpdateStatus, // canUpdateStatus
            canDelete // canDelete
        );
    };

    return (
        <SidebarLayout>
            <Head title="Opportunities List"/>
            <div className="mx-auto">
                <Heading level={1}>
                    Opportunities List
                </Heading>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <div className="py-8">
                <OpportunitiesDataTable
                    opportunities={opportunities.data}
                    currentSort={currentSort}
                    currentSearch={currentSearch}
                    columns={adminColumns}
                    routeName="admin.opportunity.list"
                    getActionsForOpportunity={getActionsForOpportunity}
                    pagination={{
                        current_page: opportunities.current_page,
                        last_page: opportunities.last_page,
                        links: opportunities.links,
                        prev_page_url: opportunities.prev_page_url,
                        next_page_url: opportunities.next_page_url,
                        from: opportunities.from,
                        to: opportunities.to,
                        total: opportunities.total
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
                            placeholder: 'Search by opportunity title...'
                        }
                    ]}
                    showSearch={true}
                    showActions={true}
                />
            </div>

            {/* Single Status Update Dialog for the entire page */}
            <OpportunityStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={handleCloseDialog}
                opportunity={selectedOpportunity}
            />
        </SidebarLayout>
    );
}
