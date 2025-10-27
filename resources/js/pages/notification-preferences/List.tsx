import React, {useState} from 'react';
import {Head} from '@inertiajs/react';
import { FrontendLayout } from '@layouts/index';
import {Heading} from '@ui/primitives/heading';
import {Text} from '@ui/primitives/text';
import {Button} from '@ui/primitives/button';
import {
    NotificationPreferencesPagePropsWithPagination,
} from '@/types';
import {BellIcon, PlusIcon} from '@heroicons/react/16/solid';
import {
    NotificationPreferencesDataTable,
    getNotificationPreferenceColumns
} from '@ui/organisms/data-table/notification-preferences';
import { AddPreferenceDialog, useNotificationPreferenceActions } from '@features/notification-preferences';

export default function List({
                                 preferences,
                                 availableOptions,
                                 attributeTypes,
                                 entityTypes
                             }: Readonly<NotificationPreferencesPagePropsWithPagination>) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const {getActionsForPreference} = useNotificationPreferenceActions();

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
                        entityTypes={entityTypes}
                    />
                </div>

                {/* Data Table */}
                <div className="space-y-6">
                    <NotificationPreferencesDataTable
                        preferences={preferences.data}
                        columns={columns}
                        routeName="notification-preferences.index"
                        getActionsForPreference={getActionsForPreference}
                        updating={false}
                        showActions={true}
                    />
                </div>
            </div>


        </FrontendLayout>
    );
}
