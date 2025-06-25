import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import BackendLayout from '@/Layouts/BackendLayout';
import AdminMenu from '@/Components/AdminMenu';
import { Notification } from '@/types';

export default function NotificationShow() {
    const notification = usePage().props.notification as Notification;
    return (
        <BackendLayout menu={<AdminMenu />}>
            <Head title={notification.title} />
            <h1 className="text-2xl font-semibold mb-4">{notification.title}</h1>
            <p className="mb-2 text-sm text-gray-600">{new Date(notification.created_at).toLocaleString()}</p>
            <p>{notification.description}</p>
        </BackendLayout>
    );
}
