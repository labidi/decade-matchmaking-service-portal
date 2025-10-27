import React from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogActions, DialogDescription, DialogTitle } from '@ui/primitives/dialog';
import { Button } from '@ui/primitives/button';
import { UserNotificationPreference } from '@/types';

interface DeletePreferenceDialogProps {
    open: boolean;
    onClose: () => void;
    preference: UserNotificationPreference | null;
}

export default function DeletePreferenceDialog({
    open,
    onClose,
    preference
}: DeletePreferenceDialogProps) {
    const { delete: deletePreference, processing } = useForm();

    const handleConfirmDelete = () => {
        if (preference) {
            const deleteForm = useForm({ id: preference.id });
            deleteForm.delete(route('notification-preferences.destroy'), {
                onSuccess: () => {
                    onClose();
                },
                onError: () => {
                    console.error('Failed to delete preference');
                }
            });
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Remove Notification Preference</DialogTitle>
            <DialogDescription>
                Are you sure you want to remove this notification preference? You will no longer
                receive email notifications for {preference?.entity_type}s matching
                "{preference?.attribute_value}".
            </DialogDescription>
            <DialogActions>
                <Button plain onClick={onClose}>
                    Cancel
                </Button>
                <Button color="red" onClick={handleConfirmDelete} disabled={processing}>
                    {processing ? 'Removing...' : 'Remove Preference'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
