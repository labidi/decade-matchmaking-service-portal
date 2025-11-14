import React from 'react';
import { Head } from '@inertiajs/react';
import { SidebarLayout } from '@/layouts';
import { Heading } from '@ui/primitives/heading';
import { UsersDataTable, adminUserColumns } from '@ui/organisms/data-table/users';
import { UserRoleDialog, UserBlockDialog, UserDetailsDialog, useUserActions } from '@features/users';
import { UsersPagination, RoleOption, StatusOption, UserFilters, SortFilters } from '@/types';
import {ArrowDownTrayIcon} from "@heroicons/react/16/solid";
import { DownloadButton } from '@/components/ui/download-button';

interface UserIndexPageProps {
    title: string;
    users: UsersPagination;
    availableRoles: RoleOption[];
    statusOptions: StatusOption[];
    filters: UserFilters;
    sort: SortFilters;
}

export default function UserIndexPage({
    title,
    users,
    availableRoles,
    statusOptions,
    filters,
    sort
}: UserIndexPageProps) {
    const {
        isRoleDialogOpen,
        isBlockDialogOpen,
        isDetailsDialogOpen,
        selectedUser,
        blockAction,
        closeRoleDialog,
        closeBlockDialog,
        closeDetailsDialog,
        getActionsForUser
    } = useUserActions();

    const searchFields = [
        {
            id: 'search',
            type: 'text',
            label: 'Search',
            placeholder: 'Search by name, email...'
        },
        {
            id: 'role',
            type: 'select',
            label: 'Role',
            placeholder: 'All roles',
            options: availableRoles.map(r => ({
                value: r.name,
                label: r.label
            }))
        },
        {
            id: 'status',
            type: 'select',
            label: 'Status',
            placeholder: 'All statuses',
            options: statusOptions
        }
    ];

    return (
        <SidebarLayout>
            <Head title={title} />
            <div className="mx-auto">
                <Heading level={1}>
                    {title}
                </Heading>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        View and manage all requests submitted by users.
                    </p>
                </div>
                <DownloadButton
                    url={route('admin.users.export.csv')}
                    fileName={'Users Export.csv'}
                    outline
                    className="flex-1 sm:flex-initial"
                >
                    <ArrowDownTrayIcon data-slot="icon" />
                    Download
                </DownloadButton>
            </div>

            <div className="py-8">
                <UsersDataTable
                    users={users.data}
                    currentSort={{
                        field: sort.sort || 'created_at',
                        order: sort.direction || 'desc'
                    }}
                    currentSearch={filters as Record<string, string>}
                    columns={adminUserColumns}
                    routeName="admin.users.index"
                    getActionsForUser={getActionsForUser}
                    pagination={{
                        current_page: users.current_page,
                        last_page: users.last_page,
                        links: users.links as any,
                        prev_page_url: users.prev_page_url,
                        next_page_url: users.next_page_url,
                        from: users.from,
                        to: users.to,
                        total: users.total
                    }}
                    searchFields={searchFields}
                    showSearch={true}
                    showActions={true}
                />
            </div>

            {/* Dialogs */}
            <UserRoleDialog
                isOpen={isRoleDialogOpen}
                onClose={closeRoleDialog}
                user={selectedUser}
                availableRoles={availableRoles}
            />

            <UserBlockDialog
                isOpen={isBlockDialogOpen}
                onClose={closeBlockDialog}
                user={selectedUser}
                action={blockAction}
            />

            <UserDetailsDialog
                isOpen={isDetailsDialogOpen}
                onClose={closeDetailsDialog}
                user={selectedUser}
            />
        </SidebarLayout>
    );
}
