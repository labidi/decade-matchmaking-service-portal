import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, Label } from '@/components/ui/fieldset';
import { Listbox, ListboxLabel, ListboxOption } from '@/components/ui/listbox';
import { OCDOpportunity } from '@/types';

interface OpportunityStatus {
    value: string;
    label: string;
}

interface OpportunityStatusDialogProps {
    isOpen: boolean;
    onClose: () => void;
    opportunity: OCDOpportunity | null;
}

// Available opportunity statuses based on the existing implementation
const availableStatuses: OpportunityStatus[] = [
    { value: '1', label: 'ACTIVE' },
    { value: '2', label: 'Closed' },
    { value: '3', label: 'Rejected' },
    { value: '4', label: 'Pending review' },
];

export function OpportunityStatusDialog({
    isOpen,
    onClose,
    opportunity
}: Readonly<OpportunityStatusDialogProps>) {
    const [selectedStatus, setSelectedStatus] = useState<OpportunityStatus | null>(null);

    const { data, setData, patch, processing, errors, reset } = useForm({
        status: '',
    });

    // Update form data when status is selected
    useEffect(() => {
        if (selectedStatus) {
            setData('status', selectedStatus.value);
        }
    }, [selectedStatus, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!opportunity || !selectedStatus) {
            return;
        }

        patch(route('partner.opportunity.status', opportunity.id), {
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

    if (!opportunity) {
        return null;
    }

    // Find current status label
    const currentStatus = availableStatuses.find(status => status.value === opportunity.status.toString());

    return (
        <Dialog open={isOpen} onClose={handleClose}>
            <DialogTitle>Update Opportunity Status</DialogTitle>
            <DialogDescription>
                Update the status for opportunity: <strong>{opportunity.title}</strong>
            </DialogDescription>
            <DialogBody>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Field>
                        <Label>Current Status</Label>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                            {currentStatus?.label || opportunity.status_label || 'Unknown'}
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
                                <ListboxOption key={status.value} value={status}>
                                    <ListboxLabel>{status.label}</ListboxLabel>
                                </ListboxOption>
                            ))}
                        </Listbox>
                        {errors.status && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.status}
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