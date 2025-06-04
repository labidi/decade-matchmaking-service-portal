// resources/js/Components/DataTableDialog.tsx
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface DataTableRow {
  [key: string]: any; // Generic row type, can be replaced with a more specific type
}
interface DataTableDialogProps {
  data: DataTableRow[];
  columns: { key: keyof DataTableRow; label: string }[];
  triggerLabel?: string;
}

/**
 * Dialog component displaying a data table using Radix UI
 */
export default function DataTableDialog<TRow extends Record<string, any>>({
  data,
  columns,
  triggerLabel = 'View Data',
}: DataTableDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="btn btn-secondary">
          {triggerLabel}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 overflow-auto">
          <Dialog.Title className="text-xl font-semibold mb-4">Data Overview</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 mb-6">
            Source from CDhub
          </Dialog.Description>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th
                      key={String(col.key)}
                      className="border-b px-4 py-2 text-left bg-gray-100"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {columns.map(col => (
                      <td key={String(col.key)} className="border-b px-4 py-2">
                        {String(row[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
