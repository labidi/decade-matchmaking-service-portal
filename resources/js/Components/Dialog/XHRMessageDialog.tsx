// resources/js/Components/XHRAlertDialog.tsx
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import React from 'react';
import { CheckIcon, Cross2Icon, InfoCircledIcon } from '@radix-ui/react-icons';

type XHRAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  type: 'success' | 'error' | 'info';
  onConfirm?: () => void;
};

export default function XHRAlertDialog({
  open,
  onOpenChange,
  message,
  type,
  onConfirm,
}: XHRAlertDialogProps) {
  const icon = {
    success: <CheckIcon className="w-6 h-6 text-green-600" />,
    error:   <Cross2Icon className="w-6 h-6 text-red-600" />,
    info:    <InfoCircledIcon className="w-6 h-6 text-blue-600" />,
  }[type];

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none">
          <div className="flex items-start space-x-4">
            {icon}
            <div className="flex-1">
              <AlertDialog.Title className="text-lg font-semibold text-gray-900">
                {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Information'}
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm text-gray-700">
                {message}
              </AlertDialog.Description>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <AlertDialog.Action asChild>
              <button
                className="px-4 py-2 rounded bg-firefly-600 text-white hover:bg-firefly-700"
                onClick={() => {
                  onConfirm?.();
                  onOpenChange(false);
                }}
              >
                OK
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
