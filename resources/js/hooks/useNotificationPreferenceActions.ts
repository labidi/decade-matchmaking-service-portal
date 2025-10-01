import {useCallback} from 'react';
import {router} from '@inertiajs/react';
import {Action} from '@/components/ui/data-table/common/dropdown-actions';
import {useDeleteConfirmation} from '@/components/ui/confirmation';
import {UserNotificationPreference} from '@/types';

interface UseNotificationPreferenceActionsReturn {
    getActionsForPreference: (preference: UserNotificationPreference) => Action[];
}

export function useNotificationPreferenceActions(): UseNotificationPreferenceActionsReturn {
    const deleteConfirmation = useDeleteConfirmation();

    // Delete handler with confirmation
    const handleDelete = useCallback(async (preference: UserNotificationPreference) => {
        await deleteConfirmation('notification preference', () => {
            router.delete(route('notification.preferences.destroy', {preference: preference.id}), {
                preserveScroll: true,
                onSuccess: () => {
                    // Success notification handled by server-side flash message
                },
                onError: (errors) => {
                    console.error('Failed to delete notification preference:', errors);
                }
            });
        });
    }, [deleteConfirmation]);

    // Toggle email notification handler with optimistic update
    const handleToggleEmail = useCallback((preference: UserNotificationPreference) => {
        router.put(
            route('notification.preferences.update', {preference: preference.id}),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Success notification handled by server-side flash message
                },
                onError: (errors) => {
                    console.error('Failed to toggle email notification:', errors);
                }
            }
        );
    }, []);

    // Build actions for a specific preference
    const getActionsForPreference = useCallback((preference: UserNotificationPreference): Action[] => {
        const actions: Action[] = [];

        // Toggle email notification action
        actions.push({
            key: 'toggle-email',
            label: preference.email_notification_enabled
                ? 'Disable email notifications'
                : 'Enable email notifications',
            onClick: () => handleToggleEmail(preference),
            divider: false,
        });

        // Delete action
        actions.push({
            key: 'delete',
            label: 'Delete preference',
            onClick: () => handleDelete(preference),
            divider: actions.length > 0,
        });

        return actions;
    }, [handleToggleEmail, handleDelete]);

    return {
        getActionsForPreference,
    };
}
