// resources/js/Components/DataTableDialog.tsx
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface DataRow {
    title: string;
    director: string;
    year: string;
}

interface DataTableDialogProps {
    triggerLabel?: string;
}

/**
 * Dialog component displaying a data table using Radix UI
 */
export default function DataTableDialog<TRow extends Record<string, any>>({
                                                                              triggerLabel = 'View Data',
                                                                          }: Readonly<DataTableDialogProps>) {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="btn btn-secondary">
                    {triggerLabel}
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50"/>
                <Dialog.Content
                    className="fixed top-1/2 left-1/2 w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 overflow-auto">
                    <Dialog.Title className="text-xl font-semibold mb-4">Data Overview</Dialog.Title>
                    <Dialog.Description className="text-sm text-gray-600 mb-6">
                        Source from CDhub
                    </Dialog.Description>

                    <div className="overflow-x-auto">

                    </div>

                    <div className="mt-6 flex justify-end">
                        <Dialog.Close asChild>
                            <button className="btn">Close</button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
