import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import {
    NotificationPreferencesPageProps,
    UserNotificationPreference
} from '@/types';
import { PlusIcon, BellIcon, EnvelopeIcon } from '@heroicons/react/16/solid';
import PreferencesList from '@/components/features/user/PreferencesList';
import AddPreferenceForm from '@/components/features/user/AddPreferenceForm';

export default function NotificationPreferences({
    preferences,
    availableOptions,
    attributeTypes
}: NotificationPreferencesPageProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [preferenceToDelete, setPreferenceToDelete] = useState<UserNotificationPreference | null>(null);

    const { delete: deletePreference, processing: deleting } = useForm();
    const { put: updatePreference, processing: updating } = useForm();

    const handleDeletePreference = (preference: UserNotificationPreference) => {
        setPreferenceToDelete(preference);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (preferenceToDelete) {
            const deleteForm = useForm({ id: preferenceToDelete.id });
            deleteForm.delete(route('notification-preferences.destroy'), {
                onSuccess: () => {
                    setShowDeleteDialog(false);
                    setPreferenceToDelete(null);
                },
                onError: () => {
                    console.error('Failed to delete preference');
                }
            });
        }
    };

    const handleToggleNotification = (preference: UserNotificationPreference, type: 'notification_enabled' | 'email_notification_enabled') => {
        // Create a form for this specific update
        const updateForm = useForm({
            ...preference,
            [type]: !preference[type]
        });

        updateForm.post(route('notification-preferences.update', preference.id), {
            preserveState: true,
            onError: () => {
                console.error('Failed to update preference');
            }
        });
    };

    const handleBulkToggle = (enabled: boolean, type: 'notification_enabled' | 'email_notification_enabled') => {
        // Get all preferences as a flat array
        const allPreferences = Object.values(preferences).flat();

        // Update each preference
        allPreferences.forEach(preference => {
            if (preference[type] !== enabled) {
                const bulkForm = useForm({
                    ...preference,
                    [type]: enabled
                });

                bulkForm.put(route('notification-preferences.update', preference.id), {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        });
    };

    const totalPreferences = Object.values(preferences).flat().length;
    const enabledInAppCount = Object.values(preferences).flat().filter(p => p.notification_enabled).length;
    const enabledEmailCount = Object.values(preferences).flat().filter(p => p.email_notification_enabled).length;

    return (
        <FrontendLayout>
            <Head title="Notification Preferences" />

            <div className="space-y-8">
                {/* Header */}
                <div>
                    <Heading level={1} className="flex items-center gap-2">
                        <BellIcon data-slot="icon" className="size-6" />
                        Notification Preferences
                    </Heading>
                    <Text className="mt-2 text-zinc-600 dark:text-zinc-400">
                        Configure when you want to receive notifications about new capacity development requests
                        that match your interests.
                    </Text>
                </div>

                {/* Stats & Actions */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                            <Text className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                Active Preferences
                            </Text>
                            <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                                <span className="flex items-center gap-1">
                                    <BellIcon data-slot="icon" className="size-4" />
                                    {enabledInAppCount} of {totalPreferences} in-app
                                </span>
                                <span className="flex items-center gap-1">
                                    <EnvelopeIcon data-slot="icon" className="size-4" />
                                    {enabledEmailCount} of {totalPreferences} email
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {totalPreferences > 0 && (
                                <>
                                    <Button
                                        outline
                                        onClick={() => handleBulkToggle(true, 'notification_enabled')}
                                        disabled={updating}
                                    >
                                        Enable All In-App
                                    </Button>
                                    <Button
                                        outline
                                        onClick={() => handleBulkToggle(true, 'email_notification_enabled')}
                                        disabled={updating}
                                    >
                                        Enable All Email
                                    </Button>
                                </>
                            )}
                            <Button
                                color="indigo"
                                onClick={() => setShowAddForm(true)}
                            >
                                <PlusIcon data-slot="icon" />
                                Add Preference
                            </Button>
                        </div>
                    </div>
                </div>

                <Divider />

                {/* Preferences List */}
                <PreferencesList
                    preferences={preferences}
                    attributeTypes={attributeTypes}
                    onToggleNotification={handleToggleNotification}
                    onDeletePreference={handleDeletePreference}
                    updating={updating}
                />

                {/* Add Preference Dialog */}
                <Dialog open={showAddForm} onClose={setShowAddForm}>
                    <DialogTitle>Add Notification Preference</DialogTitle>
                    <DialogDescription>
                        Choose the type of requests you want to be notified about when they're submitted.
                    </DialogDescription>
                    <DialogBody>
                        <AddPreferenceForm
                            availableOptions={availableOptions}
                            attributeTypes={attributeTypes}
                            onClose={() => setShowAddForm(false)}
                        />
                    </DialogBody>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onClose={setShowDeleteDialog}>
                    <DialogTitle>Remove Notification Preference</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove this notification preference? You will no longer
                        receive notifications for requests matching "{preferenceToDelete?.attribute_value}".
                    </DialogDescription>
                    <DialogActions>
                        <Button plain onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? 'Removing...' : 'Remove Preference'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </FrontendLayout>
    );
}
