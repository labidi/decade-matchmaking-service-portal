import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, Label } from '@/components/ui/fieldset';
import { Listbox, ListboxLabel, ListboxOption } from '@/components/ui/listbox';
import { OCDRequest, RequestStatus } from '@/types';

interface UpdateStatusDialogProps {
    isOpen: boolean;
    onClose: () => void;
    request: OCDRequest | null;
    availableStatuses: RequestStatus[];
}

export function UpdateStatusDialog({
    isOpen,
    onClose,
    request,
    availableStatuses
}: Readonly<UpdateStatusDialogProps>) {
    const [selectedStatus, setSelectedStatus] = useState<RequestStatus | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        status_code: '',
    });

    // Update form data when status is selected
    useEffect(() => {
        if (selectedStatus) {
            setData('status_code', selectedStatus.status_code);
        }
    }, [selectedStatus, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!request || !selectedStatus) {
            return;
        }

        post(route('admin.request.update-status', request.id), {
            onSuccess: () => {
                onClose();
                reset();
                setSelectedStatus(null);
            },
            onError: (errors) => {
                console.error('Status update failed:', errors);
            }
        });
    };

    const handleClose = () => {
        onClose();
        reset();
        setSelectedStatus(null);
    };

    if (!request) {
        return null;
    }

    return (
        <Dialog open={isOpen} onClose={handleClose}>
            <DialogTitle>Update Request Status</DialogTitle>
            <DialogDescription>
                Update the status for request: <strong>{request.title}</strong>
            </DialogDescription>
            <DialogBody>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Field>
                        <Label>Current Status</Label>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                            {request.status?.status_label || 'Unknown'}
                        </div>
                    </Field>

                    <Field>
                        <Label>New Status</Label>
                        <Listbox
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            placeholder="Select a new status"
                        >
                            {availableStatuses.map((status) => (
                                <ListboxOption key={status.id} value={status}>
                                    <ListboxLabel>{status.status_label}</ListboxLabel>
                                </ListboxOption>
                            ))}
                        </Listbox>
                        {errors.status_code && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.status_code}
                            </p>
                        )}
                    </Field>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            outline
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !selectedStatus}
                        >
                            {processing ? 'Updating...' : 'Update Status'}
                        </Button>
                    </div>
                </form>
            </DialogBody>
        </Dialog>
    );
}
