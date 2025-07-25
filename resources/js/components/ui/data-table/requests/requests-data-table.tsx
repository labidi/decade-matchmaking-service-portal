import React from 'react';
import {ChevronDownIcon, ChevronUpIcon} from '@heroicons/react/16/solid';
import {OCDRequestList, PaginationLinkProps, OCDRequestStatus} from "@/types";
import {Table, TableHead, TableBody, TableRow, TableHeader, TableCell} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge'
import {TablePaginationNav} from "@/components/ui/table-pagination-nav";
import {formatDate} from '@/utils/date-formatter';
import {router} from '@inertiajs/react';
import {TableSearch} from '@/components/ui/data-table/search/table-search';

// Types and Interfaces
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

type SortField = 'id' | 'created_at' | 'status_id' | 'user_id';

interface RequestsDataTableProps {
    requests: OCDRequestList;
    currentSort: {
        field: string;
        order: string;
    };
    currentSearch?: Record<string, string>;
    pagination?: PaginationData;
}

// Utility Functions
const statusBadgeRenderer = (status: OCDRequestStatus) => {
    let color: "teal" | "cyan" | "amber" | "green" | "blue" | "red" | "orange" | "yellow" | "lime" | "emerald" | "sky" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose" | "zinc" | undefined;
    switch (status.status_code) {
        case 'draft':
            color = 'zinc';
            break;
        case 'under_review':
            color = 'amber';
            break;
        case 'validated':
            color = 'green';
            break;
        case 'offer_made':
            color = 'blue';
            break;
        case 'in_implementation':
            color = 'blue';
            break;
        case 'rejected':
        case 'unmatched':
            color = 'red';
            break;
        case 'closed':
            color = "teal";
            break;
    }

    return (
        <Badge color={color}>{status.status_label}</Badge>
    );
};

// Search Configuration
const searchFields = [
    {
        key: 'user',
        label: 'Submitted By',
        placeholder: 'Search by user name...'
    },
    {
        key: 'title',
        label: 'Title',
        placeholder: 'Search by request title...'
    }
];

export function RequestsDataTable({requests, currentSort, currentSearch = {}, pagination}: Readonly<RequestsDataTableProps>) {
    
    // Event Handlers
    const handleSort = (field: SortField) => {
        const newOrder = currentSort.field === field && currentSort.order === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.request.list'), {
            sort: field,
            order: newOrder
        }, {
            preserveState: false,
            preserveScroll: true
        });
    };

    // Helper Functions
    const getSortIcon = (field: SortField) => {
        if (currentSort.field !== field) {
            return <ChevronDownIcon className="size-4 opacity-50"/>;
        }
        return currentSort.order === 'asc'
            ? <ChevronUpIcon className="size-4"/>
            : <ChevronDownIcon className="size-4"/>;
    };

    return (
        <>
            <TableSearch
                searchFields={searchFields}
                routeName="admin.request.list"
                currentSearch={currentSearch}
                preserveSort={true}
            />
            
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeader>
                            <button
                                onClick={() => handleSort('id')}
                                className="flex items-center gap-1 font-semibold hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                ID
                                {getSortIcon('id')}
                            </button>
                        </TableHeader>
                        <TableHeader>
                            Title
                        </TableHeader>
                        <TableHeader>
                            <button
                                onClick={() => handleSort('user_id')}
                                className="flex items-center gap-1 font-semibold hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                Submitted By
                                {getSortIcon('user_id')}
                            </button>
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
                                onClick={() => handleSort('status_id')}
                                className="flex items-center gap-1 font-semibold hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                Status
                                {getSortIcon('status_id')}
                            </button>
                        </TableHeader>
                        <TableHeader className="text-right">
                            Actions
                        </TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {requests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                                No requests found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell className="font-medium">
                                    {request.id}
                                </TableCell>
                                <TableCell>
                                    {request.detail.capacity_development_title || 'No Title'}
                                </TableCell>
                                <TableCell>
                                    {request.user.name}
                                </TableCell>
                                <TableCell className="text-zinc-500">
                                    {formatDate(request.created_at)}
                                </TableCell>
                                <TableCell>
                                    {statusBadgeRenderer(request.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {/* Actions can be added here */}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            
            {/* Pagination */}
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
