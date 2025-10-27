import React from 'react';
import {
    UserNotificationPreference,
    NotificationPreferencesList,
    NotificationPreferencesPagination,
    NotificationPreferenceTableColumn,
} from '@/types';
import {Table, TableHead, TableBody, TableRow, TableHeader, TableCell} from '@ui/primitives/table';
import {TablePaginationNav} from '@ui/molecules';
import {DropdownActions, Action} from '@ui/organisms/data-table/common';

type SortField = 'entity_type' | 'attribute_type' | 'attribute_value' | 'created_at' | 'updated_at';

interface NotificationPreferencesDataTableProps {
    preferences: NotificationPreferencesPagination | NotificationPreferencesList;
    columns: NotificationPreferenceTableColumn[];
    routeName?: string;
    getActionsForPreference?: (preference: UserNotificationPreference) => Action[];
    showActions?: boolean;
    updating?: boolean;
}

export function NotificationPreferencesDataTable({
                                                     preferences,
                                                     columns,
                                                     routeName = 'notification-preferences.index',
                                                     getActionsForPreference,
                                                     showActions = true,
                                                     updating = false
                                                 }: Readonly<NotificationPreferencesDataTableProps>) {

    // Extract data array based on whether we have pagination or not
    const preferencesData = Array.isArray(preferences) ? preferences : preferences.data;
    const pagination = !Array.isArray(preferences) ? preferences : undefined;
    const totalColumns = columns.length + (showActions && getActionsForPreference ? 1 : 0);

    return (
        <>
            <div className="overflow-x-auto">
                <Table
                    className="[--gutter:--spacing(4)] sm:[--gutter:--spacing(6)] lg:[--gutter:--spacing(8)] min-w-full">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHeader key={column.key}
                                             className={`${column.headerClassName || ''} whitespace-nowrap`}>
                                    <span className="font-medium">{column.label}</span>
                                </TableHeader>
                            ))}
                            {showActions && getActionsForPreference && (
                                <TableHeader className="text-right">
                                    <span className="sr-only">Actions</span>
                                </TableHeader>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {preferencesData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={totalColumns}
                                           className="text-center text-zinc-500 dark:text-zinc-400 py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-lg font-medium">No notification preferences found</span>
                                        <span className="text-sm">Add your first preference to start receiving email notifications.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            preferencesData.map((preference: UserNotificationPreference) => (
                                <TableRow key={preference.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                    {columns.map((column) => (
                                        <TableCell key={column.key} className={column.className}>
                                            {column.render(preference)}
                                        </TableCell>
                                    ))}
                                    {showActions && getActionsForPreference && (
                                        <TableCell className="text-right">
                                            <DropdownActions
                                                actions={getActionsForPreference(preference)}
                                            />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

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
