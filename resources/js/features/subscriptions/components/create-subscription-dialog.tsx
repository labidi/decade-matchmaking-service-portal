import React from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@ui/primitives/dialog';
import { Button } from '@ui/primitives/button';
import { Text } from '@ui/primitives/text';
import { FieldRenderer } from '@ui/organisms/forms';
import { subscribeFormFields } from '../config';
import { useSubscribeForm } from '../hooks/use-subscribe-form';
import { SubscriptionFormOptions } from '../types/subscription.types';

interface CreateSubscriptionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    users: SubscriptionFormOptions['users'];
    requests: SubscriptionFormOptions['requests'];
}

export function CreateSubscriptionDialog({
    isOpen,
    onClose,
    users,
    requests,
}: CreateSubscriptionDialogProps) {
    const subscribeForm = useSubscribeForm({
        onSuccess: () => {
            router.reload();
            onClose();
        }
    });

    // Merge options into form fields
    const formFieldsWithOptions = {
        ...subscribeFormFields[0].fields,
        user_id: {
            ...subscribeFormFields[0].fields.user_id,
            options: users
        },
        request_id: {
            ...subscribeFormFields[0].fields.request_id,
            options: requests
        }
    };

    const handleClose = () => {
        subscribeForm.form.reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={handleClose}>
            <DialogTitle>Subscribe User to Request</DialogTitle>
            <DialogDescription>
                Subscribe a user to receive updates about a specific capacity development request.
            </DialogDescription>
            <DialogBody>
                <div className="space-y-4">
                    {Object.entries(formFieldsWithOptions).map(([name, field]) => (
                        <FieldRenderer
                            key={name}
                            name={name}
                            field={field}
                            value={subscribeForm.form.data[name as keyof typeof subscribeForm.form.data]}
                            error={subscribeForm.form.errors[name as keyof typeof subscribeForm.form.errors]}
                            onChange={subscribeForm.handleFieldChange}
                            formData={subscribeForm.form.data}
                        />
                    ))}
                    {(subscribeForm.form.errors as Record<string, string>).general && (
                        <Text className="text-red-600 text-sm">
                            {(subscribeForm.form.errors as Record<string, string>).general}
                        </Text>
                    )}
                </div>
            </DialogBody>
            <DialogActions>
                <Button
                    plain
                    onClick={handleClose}
                    disabled={subscribeForm.form.processing}
                >
                    Cancel
                </Button>
                <Button
                    onClick={subscribeForm.handleSubmit}
                    disabled={
                        subscribeForm.form.processing ||
                        !subscribeForm.form.data.user_id ||
                        !subscribeForm.form.data.request_id
                    }
                >
                    {subscribeForm.form.processing ? 'Creating...' : 'Create Subscription'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
