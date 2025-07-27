import React from 'react';
import {ChevronDownIcon, ChevronUpIcon} from '@heroicons/react/16/solid';
import {OCDOpportunitiesList, PaginationLinkProps} from "@/types";
import {Table, TableHead, TableBody, TableRow, TableHeader, TableCell} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge'
import {router} from '@inertiajs/react';
import {TablePaginationNav} from "@/components/ui/table-pagination-nav";
import {formatDate} from '@/utils/date-formatter';
import {TableSearch} from '@/components/ui/data-table/search/table-search';

interface PaginationData {
    current_page: number;
    last_page: number;
    links: PaginationLinkProps[];
    prev_page_url: string | null;
    next_page_url: string | null;
    from: number;
    to: number;
    total: number;
}

type SortField = 'title' | 'type' | 'closing_date' | 'status' | 'created_at';

interface OpportunitiesDataTableProps {
    opportunities: OCDOpportunitiesList;
    currentSort: {
        field: string;
        order: string;
    };
    currentSearch?: Record<string, string>;
    pagination?: PaginationData;
}


const statusBadgeRenderer = (status: number, statusLabel: string) => {
    let color: "teal" | "cyan" | "amber" | "green" | "blue" | "red" | "orange" | "yellow" | "lime" | "emerald" | "sky" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose" | "zinc" | undefined;
    switch (status) {
        case 1: // ACTIVE
            color = 'green';
            break;
        case 2: // CLOSED
            color = 'zinc';
            break;
        case 3: // REJECTED
            color = 'red';
            break;
        case 4: // PENDING_REVIEW
            color = 'amber';
            break;
        default:
            color = 'zinc';
    }
    return (
        <Badge color={color}>{statusLabel}</Badge>
    );
};

export function OpportunitiesDataTable({opportunities, currentSort, currentSearch = {}, pagination}: Readonly<OpportunitiesDataTableProps>) {
    const handleSort = (field: SortField) => {
        const newOrder = currentSort.field === field && currentSort.order === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.opportunity.list'), {
            sort: field,
            order: newOrder
        }, {
            preserveState: false,
            preserveScroll: true
        });
    };

    const getSortIcon = (field: SortField) => {
        if (currentSort.field !== field) {
            return <ChevronDownIcon className="size-4 opacity-50"/>;
        }
        return currentSort.order === 'asc'
            ? <ChevronUpIcon className="size-4"/>
            : <ChevronDownIcon className="size-4"/>;
    };

    const searchFields = [
        {
            key: 'user',
            label: 'Submitted By',
            placeholder: 'Search by user name...'
        },
        {
            key: 'title',
            label: 'Title',
            placeholder: 'Search by Opportunity title...'
        }
    ];
    return (
        <>
            <TableSearch
                searchFields={searchFields}
                routeName="admin.opportunity.list"
                currentSearch={currentSearch}
                preserveSort={true}
            />
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeader>
                            ID
                        </TableHeader>
                        <TableHeader>
                            <button
                                onClick={() => handleSort('title')}
                                className="flex items-center gap-1 font-semibold hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                Title
                                {getSortIcon('title')}
                            </button>
                        </TableHeader>
                        <TableHeader>
                            <button
                                onClick={() => handleSort('type')}
                                className="flex items-center gap-1 font-semibold hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                Type
                                {getSortIcon('type')}
                            </button>
                        </TableHeader>
                        <TableHeader>
                            <button
                                onClick={() => handleSort('closing_date')}
                                className="flex items-center gap-1 font-semibold hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                Closing Date
                                {getSortIcon('closing_date')}
                            </button>
                        </TableHeader>
                        <TableHeader>
                            Submitted By
                        </TableHeader>
                        <TableHeader>
                            <button
                                onClick={() => handleSort('created_at')}
                                className="flex items-center gap-1 font-semibold hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                Submitted At
                                {getSortIcon('created_at')}
                            </button>
                        </TableHeader>
                        <TableHeader>
                            <button
                                onClick={() => handleSort('status')}
                                className="flex items-center gap-1 font-semibold hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                Status
                                {getSortIcon('status')}
                            </button>
                        </TableHeader>
                        <TableHeader className="text-right">
                            Actions
                        </TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {opportunities.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-zinc-500 py-8">
                                No opportunities found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        opportunities.map((opportunity) => (
                            <TableRow key={opportunity.id}>
                                <TableCell className="font-medium">
                                    {opportunity.id}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {opportunity.title}
                                </TableCell>
                                <TableCell>
                                    {opportunity.type_label || opportunity.type}
                                </TableCell>
                                <TableCell className="text-zinc-500">
                                    {opportunity.closing_date ? formatDate(opportunity.closing_date) : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {opportunity.user?.name || 'N/A'}
                                </TableCell>
                                <TableCell className="text-zinc-500">
                                    {formatDate(opportunity.created_at)}
                                </TableCell>
                                <TableCell>
                                    {statusBadgeRenderer(opportunity.status, opportunity.status_label)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {/* Actions can be added here */}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {pagination && (
                <TablePaginationNav
                    links={pagination.links}
                    prevPageUrl={pagination.prev_page_url}
                    nextPageUrl={pagination.next_page_url}
                    from={pagination.from}
                    to={pagination.to}
                    total={pagination.total}
                />
            )}
        </>
    );
}
