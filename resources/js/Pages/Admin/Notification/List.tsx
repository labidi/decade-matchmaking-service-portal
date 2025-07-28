import {Head} from '@inertiajs/react';

import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'

import {NotificationList, PaginationLinkProps} from '@/types';
import {NotificationsDataTable} from '@/components/ui/data-table/notifications/notifications-data-table';
import React from "react";
import {Heading} from "@/components/ui/heading";

interface NotificationPagination {
    current_page: number;
    data: NotificationList,
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

interface NotificationListPageProps {
    notifications: NotificationPagination;
    currentSort: {
        field: string;
        order: string;
    };
}

export default function NotificationListPage({notifications, currentSort}: Readonly<NotificationListPageProps>) {

    return (
        <SidebarLayout>
            <Head title="Notifications"/>
            <div className="mx-auto">
                <Heading level={1}>
                    Notifications List
                </Heading>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <div className="py-8">
                <NotificationsDataTable
                    notifications={notifications.data}
                    currentSort={currentSort}
                    pagination={{
                        current_page: notifications.current_page,
                        last_page: notifications.last_page,
                        links: notifications.links,
                        prev_page_url: notifications.prev_page_url,
                        next_page_url: notifications.next_page_url,
                        from: notifications.from,
                        to: notifications.to,
                        total: notifications.total
                    }}
                />
            </div>
        </SidebarLayout>
    );
}
