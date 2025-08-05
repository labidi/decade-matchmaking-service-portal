import React from 'react';
import {ChevronDownIcon, ChevronUpIcon} from '@heroicons/react/16/solid';
import {OCDOpportunity, OCDOpportunitiesList, PaginationLinkProps, UIField} from "@/types";
import {Table, TableHead, TableBody, TableRow, TableHeader, TableCell} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge'
import {router} from '@inertiajs/react';
import {TablePaginationNav} from "@/components/ui/table-pagination-nav";
import {formatDate} from '@/utils/date-formatter';
import {TableSearch} from '@/components/ui/data-table/search/table-search';
import { DropdownActions, Action } from '@/components/ui/data-table/common/dropdown-actions';

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

type SortField = 'id' | 'title' | 'type' | 'closing_date' | 'status' | 'created_at';

interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    sortField?: SortField;
    render: (opportunity: OCDOpportunity) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

interface OpportunitiesDataTableProps {
    opportunities: OCDOpportunitiesList;
    currentSort: {
        field: string;
        order: string;
    };
    currentSearch?: Record<string, string>;
    pagination?: PaginationData;
    searchFields?: UIField[];
    columns?: TableColumn[];
    routeName?: string;
    getActionsForOpportunity: (opportunity: OCDOpportunity) => Action[];
    showSearch?: boolean;
    showActions?: boolean;
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

export function OpportunitiesDataTable({
    opportunities,
    currentSort,
    currentSearch = {},
    pagination,
    searchFields = [],
    columns,
    routeName = 'admin.opportunity.list',
    getActionsForOpportunity,
    showSearch = true,
    showActions = true
}: Readonly<OpportunitiesDataTableProps>) {

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
            render: (opportunity) => (
                <span className="font-medium">{opportunity.id}</span>
            )
        },
        {
            key: 'title',
            label: 'Title',
            sortable: true,
            sortField: 'title',
            render: (opportunity) => (
                <span className="font-medium">{opportunity.title}</span>
            )
        },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            sortField: 'type',
            render: (opportunity) => (
                <span>{opportunity.type_label || opportunity.type}</span>
            )
        },
        {
            key: 'closing_date',
            label: 'Closing Date',
            sortable: true,
            sortField: 'closing_date',
            render: (opportunity) => (
                <span className="text-zinc-500">
                    {opportunity.closing_date ? formatDate(opportunity.closing_date) : 'N/A'}
                </span>
            )
        },
        {
            key: 'user',
            label: 'Submitted By',
            render: (opportunity) => (
                <span>{opportunity.user?.name ?? 'N/A'}</span>
            )
        },
        {
            key: 'created_at',
            label: 'Submitted At',
            sortable: true,
            sortField: 'created_at',
            render: (opportunity) => (
                <span className="text-zinc-500">{formatDate(opportunity.created_at)}</span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            sortField: 'status',
            render: (opportunity) => statusBadgeRenderer(opportunity.status, opportunity.status_label)
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
                    {opportunities.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={totalColumns} className="text-center text-zinc-500 py-8">
                                No opportunities found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        opportunities.map((opportunity) => (
                            <TableRow key={opportunity.id}>
                                {activeColumns.map((column) => (
                                    <TableCell key={column.key} className={column.className}>
                                        {column.render(opportunity)}
                                    </TableCell>
                                ))}
                                {showActions && (
                                    <TableCell className="text-right">
                                        <DropdownActions
                                            actions={getActionsForOpportunity(opportunity)}
                                        />
                                    </TableCell>
                                )}
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
