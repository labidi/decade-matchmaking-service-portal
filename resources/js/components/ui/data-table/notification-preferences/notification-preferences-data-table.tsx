import React from 'react';
import {
    UserNotificationPreference,
    NotificationPreferencesList,
    NotificationPreferencesPagination,
    NotificationPreferenceTableColumn,
} from '@/types';
import {Table, TableHead, TableBody, TableRow, TableHeader, TableCell} from '@/components/ui/table';
import {TablePaginationNav} from '@/components/ui/table-pagination-nav';
import {PreferenceActionsDropdown} from './preference-actions-dropdown';

type SortField = 'entity_type' | 'attribute_type' | 'attribute_value' | 'created_at' | 'updated_at';

interface NotificationPreferencesDataTableProps {
    preferences: NotificationPreferencesPagination | NotificationPreferencesList;
    columns: NotificationPreferenceTableColumn[];
    routeName?: string;
    onToggle: (preference: UserNotificationPreference, type: 'email_notification_enabled') => void;
    onDeletePreference: (preference: UserNotificationPreference) => void;
    onEditPreference?: (preference: UserNotificationPreference) => void;
    showActions?: boolean;
    updating?: boolean;
}

export function NotificationPreferencesDataTable({
                                                     preferences,
                                                     columns,
                                                     routeName = 'notification-preferences.index',
                                                     onToggle,
                                                     onDeletePreference,
                                                     onEditPreference,
                                                     showActions = true,
                                                     updating = false
                                                 }: Readonly<NotificationPreferencesDataTableProps>) {

    // Extract data array based on whether we have pagination or not
    const preferencesData = Array.isArray(preferences) ? preferences : preferences.data;
    const pagination = !Array.isArray(preferences) ? preferences : undefined;

    const getActionsForPreference = (preference: UserNotificationPreference) => {
        return [
            ...(onEditPreference ? [{
                key: 'edit',
                label: 'Edit Preference',
                onClick: () => onEditPreference(preference),
                disabled: updating
            }] : []),
            {
                key: 'delete',
                label: 'Delete Preference',
                onClick: () => onDeletePreference(preference),
                disabled: updating,
                divider: !!onEditPreference
            }
        ];
    };

    const totalColumns = columns.length + (showActions ? 1 : 0);

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
                            {showActions && (
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
                                    {showActions && (
                                        <TableCell className="text-right">
                                            <PreferenceActionsDropdown
                                                preference={preference}
                                                onEdit={onEditPreference}
                                                onDelete={onDeletePreference}
                                                disabled={updating}
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
