import React, {useState} from 'react';
import {Head} from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import {Heading} from '@/components/ui/heading';
import {Text} from '@/components/ui/text';
import {Button} from '@/components/ui/button';
import {
    NotificationPreferencesPagePropsWithPagination,
} from '@/types';
import {BellIcon, PlusIcon} from '@heroicons/react/16/solid';
import {
    NotificationPreferencesDataTable,
    getNotificationPreferenceColumns
} from '@/components/ui/data-table/notification-preferences';
import AddPreferenceDialog from '@/components/features/notification-preferences/AddPreferenceDialog';

export default function List({
                                 preferences,
                                 availableOptions,
                                 attributeTypes,
                                 entityTypes
                             }: Readonly<NotificationPreferencesPagePropsWithPagination>) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Generate column configuration
    const columns = getNotificationPreferenceColumns({
        updating: false
    });

    return (
        <FrontendLayout>
            <Head title="Notification Preferences"/>

            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between">
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
                    <Button
                        color="indigo"
                        onClick={() => setIsAddDialogOpen(true)}
                        className="shrink-0"
                    >
                        <PlusIcon data-slot="icon"/>
                        Add Preference
                    </Button>
                    <AddPreferenceDialog
                        open={isAddDialogOpen}
                        onClose={() => setIsAddDialogOpen(false)}
                        availableOptions={availableOptions}
                    />
                </div>

                {/* Data Table */}
                <div className="space-y-6">
                    <NotificationPreferencesDataTable
                        preferences={preferences.data}
                        columns={columns}
                        routeName="notification-preferences.index"
                        onDeletePreference={() => {
                        }} // No-op since we removed delete functionality
                        updating={false}
                        showActions={false} // Disable actions since we removed delete functionality
                    />
                </div>
            </div>


        </FrontendLayout>
    );
}
