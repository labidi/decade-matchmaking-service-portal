import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import BackendLayout from '@/Layouts/BackendLayout';
import AdminMenu from '@/Components/AdminMenu';
import axios from 'axios';
import { NotificationList } from '@/types';

export default function NotificationListPage() {
    const notifications = usePage().props.notifications as NotificationList;
    const [items, setItems] = React.useState(notifications);

    const markAsRead = (id: number) => {
        axios.patch(route('admin.notifications.read', id)).then(() => {
            setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        });
    };

    return (
        <BackendLayout menu={<AdminMenu />}>
            <Head title="Notifications" />
            <div className="space-y-4">
                {items.map(n => (
                    <div key={n.id} className="border p-4 rounded bg-white flex justify-between items-start">
                        <div>
                            <Link href={route('admin.notifications.show', n.id)} className="font-semibold text-lg text-firefly-700 hover:underline">
                                {n.title}
                            </Link>
                            <p className="text-sm text-gray-600">{new Date(n.created_at).toLocaleString()}</p>
                        </div>
                        {!n.is_read && (
                            <button onClick={() => markAsRead(n.id)} className="text-sm text-blue-600 hover:underline">
                                Mark as read
                            </button>
                        )}
                    </div>
                ))}
                {items.length === 0 && <p>No notifications found.</p>}
            </div>
        </BackendLayout>
    );
}
