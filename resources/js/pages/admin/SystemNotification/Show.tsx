import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { SidebarLayout } from '@layouts/index';
import { AdminMenu } from '@layouts/components';
import { Notification } from '@/types';
import {Heading} from "@ui/primitives/heading";

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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{notification.title}</h1>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{new Date(notification.created_at).toLocaleString()}</p>
            {/*
             * Using dangerouslySetInnerHTML to render HTML content from the backend.
             * Security Note: Only safe because content comes from trusted Laravel backend.
             * If using external/user content, sanitization would be required.
             */}
            <div
                className="text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: notification.description }}
            />
        </SidebarLayout>
    );
}
