import React, {useState} from 'react';
import {Head, Link, usePage} from '@inertiajs/react';
import {OCDOpportunity, OCDOpportunitiesList, OCDOpportunitiesListPageActions, PaginationLinkProps} from '@/types';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import {OpportunitiesDataTable} from '@/components/ui/data-table/opportunities/opportunities-data-table';
import {partnerColumns} from '@/components/ui/data-table/opportunities/column-configs';
import {buildOpportunityActions} from '@/components/ui/data-table/opportunities/opportunities-actions-column';
import {OpportunityStatusDialog} from '@/components/ui/dialogs/OpportunityStatusDialog';
import {router} from '@inertiajs/react';


interface OpportunitiesPagination {
    current_page: number;
    data: OCDOpportunitiesList;
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
    pageActions: OCDOpportunitiesListPageActions;
    currentSort?: {
        field: string;
        order: string;
    };
    currentSearch?: Record<string, string>;
}

export default function OpportunitiesList({
                                              opportunities,
                                              pageActions,
                                              currentSort = {field: 'created_at', order: 'desc'},
                                              currentSearch = {}
                                          }: Readonly<OpportunitiesListPageProps>) {
    const page = usePage();
    const {auth} = page.props;

    // Dialog state management
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
    // Build actions for each opportunity - partners can edit their own opportunities
    const getActionsForOpportunity = (opportunity: OCDOpportunity) => {
        return buildOpportunityActions(
            opportunity,
            handleUpdateStatus,
            handleDelete,
            true, // showViewDetails
            pageActions.canChangeStatus, // canUpdateStatus
            pageActions.canDelete && opportunity.can_edit // canDelete - only if they own it
        );
    };

    return (
        <FrontendLayout>
            <Head title="My Opportunities"/>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        My Opportunities
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your published opportunities
                    </p>
                </div>
                {auth.user.is_partner && pageActions.canSubmitNew && (
                    <Link
                        href={route('partner.opportunity.create')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                        </svg>
                        Submit New Opportunity
                    </Link>
                )}
            </div>

            <OpportunitiesDataTable
                opportunities={opportunities.data}
                currentSort={currentSort}
                currentSearch={currentSearch}
                columns={partnerColumns}
                routeName="opportunity.list"
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
                        id: 'title',
                        type: 'text',
                        label: 'Title',
                        placeholder: 'Search by opportunity title...'
                    },
                    {
                        id: 'type',
                        type: 'select',
                        label: 'Type',
                        placeholder: 'Filter by type...',
                        options: [
                            {value: 'training', label: 'Training'},
                            {value: 'fellowship', label: 'Fellowship'},
                            {value: 'grant', label: 'Grant'},
                            {value: 'scholarship', label: 'Scholarship'},
                            {value: 'workshop', label: 'Workshop'},
                            {value: 'conference', label: 'Conference'},
                            {value: 'other', label: 'Other'}
                        ]
                    },
                    {
                        id: 'status',
                        type: 'select',
                        label: 'Status',
                        placeholder: 'Filter by status...',
                        options: [
                            {value: '1', label: 'Active'},
                            {value: '2', label: 'Closed'},
                            {value: '3', label: 'Rejected'},
                            {value: '4', label: 'Pending Review'}
                        ]
                    }
                ]}
                showSearch={true}
                showActions={true}
            />

            {/* Status Update Dialog */}
            <OpportunityStatusDialog
                isOpen={isStatusDialogOpen}
                onClose={handleCloseDialog}
                opportunity={selectedOpportunity}
            />
        </FrontendLayout>
    )
}
