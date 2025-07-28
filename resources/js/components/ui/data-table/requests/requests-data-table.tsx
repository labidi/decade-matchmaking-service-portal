import React from 'react';
import {ChevronDownIcon, ChevronUpIcon} from '@heroicons/react/16/solid';
import {OCDRequest, OCDRequestList, PaginationLinkProps, OCDRequestStatus} from "@/types";
import {Table, TableHead, TableBody, TableRow, TableHeader, TableCell} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge'
import {TablePaginationNav} from "@/components/ui/table-pagination-nav";
import {formatDate} from '@/utils/date-formatter';
import {router} from '@inertiajs/react';
import {TableSearch} from '@/components/ui/data-table/search/table-search';
import {RequestsActionColumn, RequestAction} from '@/components/ui/data-table/requests/requests-action-column';

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

interface DataTableSearchFields {
    key: string;
    label: string;
    placeholder: string;
}

interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    sortField?: SortField;
    render: (request: OCDRequest) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

interface RequestsDataTableProps {
    requests: OCDRequestList;
    currentSort: {
        field: string;
        order: string;
    };
    currentSearch?: Record<string, string>;
    pagination?: PaginationData;
    searchFields?: DataTableSearchFields[];
    columns?: TableColumn[];
    routeName?: string;
    actions?: RequestAction[];
    showSearch?: boolean;
    showActions?: boolean;
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

export function RequestsDataTable({
                                      requests,
                                      currentSort,
                                      currentSearch = {},
                                      pagination,
                                      searchFields = [],
                                      columns,
                                      routeName = 'admin.request.list',
                                      actions,
                                      showSearch = true,
                                      showActions = true
                                  }: Readonly<RequestsDataTableProps>) {

    const handleSort = (field: SortField) => {
        const newOrder = currentSort.field === field && currentSort.order === 'asc' ? 'desc' : 'asc';
        router.get(route(routeName), {
            sort: field,
            order: newOrder
        }, {
            preserveState: false,
            preserveScroll: true
        });
    };

    // Default columns for admin interface
    const defaultColumns: TableColumn[] = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            sortField: 'id',
            render: (request) => (
                <span className="font-medium">{request.id}</span>
            )
        },
        {
            key: 'title',
            label: 'Title',
            render: (request) => (
                <span>{request.detail.capacity_development_title || 'No Title'}</span>
            )
        },
        {
            key: 'user',
            label: 'Submitted By',
            sortable: true,
            sortField: 'user_id',
            render: (request) => (
                <span>{request.user.name}</span>
            )
        },
        {
            key: 'created_at',
            label: 'Submitted At',
            sortable: true,
            sortField: 'created_at',
            render: (request) => (
                <span className="text-zinc-500">{formatDate(request.created_at)}</span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            sortField: 'status_id',
            render: (request) => statusBadgeRenderer(request.status)
        }
    ];

    const activeColumns = columns || defaultColumns;

    // Helper Functions
    const getSortIcon = (field: SortField) => {
        if (currentSort.field !== field) {
            return <ChevronDownIcon className="size-4 opacity-50"/>;
        }
        return currentSort.order === 'asc'
            ? <ChevronUpIcon className="size-4"/>
            : <ChevronDownIcon className="size-4"/>;
    };
    const totalColumns = activeColumns.length + (showActions ? 1 : 0);

    return (
        <>
            {showSearch && (
                <TableSearch
                    searchFields={searchFields}
                    routeName={routeName}
                    currentSearch={currentSearch}
                    preserveSort={true}
                />
            )}

            <Table>
                <TableHead className="text-lg">
                    <TableRow>
                        {activeColumns.map((column) => (
                            <TableHeader key={column.key} className={column.headerClassName}>
                                {column.sortable && column.sortField ? (
                                    <button
                                        onClick={() => handleSort(column.sortField!)}
                                        className="flex items-center gap-1 font-semibold hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        {column.label}
                                        {getSortIcon(column.sortField)}
                                    </button>
                                ) : (
                                    column.label
                                )}
                            </TableHeader>
                        ))}
                        {showActions && (
                            <TableHeader className="text-right">
                            </TableHeader>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody className="text-lg">
                    {requests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={totalColumns} className="text-center text-zinc-500 py-8">
                                No requests found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        requests.map((request) => (
                            <TableRow key={request.id}>
                                {activeColumns.map((column) => (
                                    <TableCell key={column.key} className={column.className}>
                                        {column.render(request)}
                                    </TableCell>
                                ))}
                                {showActions && (
                                    <TableCell className="text-right">
                                        <RequestsActionColumn
                                            row={request}
                                            actions={actions}
                                        />
                                    </TableCell>
                                )}
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
