import React from 'react';
import { Head, router } from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import {
    NotificationPreferencesPagePropsWithPagination,
    UserNotificationPreference,
} from '@/types';
import { BellIcon } from '@heroicons/react/16/solid';
import {
    NotificationPreferencesDataTable,
    getNotificationPreferenceColumns
} from '@/components/ui/data-table/notification-preferences';

export default function List({
                                                    preferences,
                                                    attributeTypes,
                                                    currentFilters,
                                                    currentSort
                                                }: NotificationPreferencesPagePropsWithPagination) {
    const handleToggleNotification = (preference: UserNotificationPreference, type: 'email_notification_enabled') => {
        // Update preference with the toggled value
        const updatedPreference = {
            ...preference,
            [type]: !preference[type]
        };

        // Use router to make the PUT request
        router.put(route('notification-preferences.update', preference.id), updatedPreference, {
            preserveState: true,
            preserveScroll: true,
            only: ['preferences'],
            onError: () => {
                console.error('Failed to update preference');
            }
        });
    };

    // Generate column configuration
    const columns = getNotificationPreferenceColumns({
        onToggle: handleToggleNotification,
        updating: false
    });

    return (
        <FrontendLayout>
            <Head title="Notification Preferences"/>

            <div className="space-y-8">
                {/* Header */}
                <div>
                    <Heading level={1} className="flex items-center gap-2">
                        <BellIcon data-slot="icon" className="size-6"/>
                        Notification Preferences
                    </Heading>
                    <Text className="mt-2 text-zinc-600 dark:text-zinc-400">
                        Configure when you want to receive email notifications about new requests and opportunities
                        that match your interests.
                    </Text>
                </div>

                {/* Data Table */}
                <div className="space-y-6">
                    <NotificationPreferencesDataTable
                        preferences={preferences}
                        columns={columns}
                        routeName="notification-preferences.index"
                        onToggle={handleToggleNotification}
                        onDeletePreference={() => {}} // No-op since we removed delete functionality
                        updating={false}
                        showActions={false} // Disable actions since we removed delete functionality
                    />
                </div>
            </div>
        </FrontendLayout>
    );
}
