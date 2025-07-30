import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import {SidebarLayout} from '@/components/ui/layouts/sidebar-layout'
import AdminMenu from '@/Components/Layout/AdminMenu';
import { Notification } from '@/types';
import {Heading} from "@/components/ui/heading";

export default function NotificationShow() {
    const notification = usePage().props.notification as Notification;
    return (
        <SidebarLayout>
            <Head title={notification.title} />
            <div className="mx-auto">
                <Heading level={1}>
                    Notification Details
                </Heading>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <h1 className="text-2xl font-semibold mb-4">{notification.title}</h1>
            <p className="mb-2 text-sm text-gray-600">{new Date(notification.created_at).toLocaleString()}</p>
            <p>{notification.description}</p>
        </SidebarLayout>
    );
}
