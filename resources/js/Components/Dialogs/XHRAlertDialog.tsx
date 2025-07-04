// resources/js/Components/XHRAlertDialog.tsx
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import React from 'react';
import { CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';

type XHRAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  type: 'success' | 'error' | 'info' | 'redirect';
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
    success: <CheckCircle className="w-6 h-6 text-green-600" />,
    redirect: <CheckCircle className="w-6 h-6 text-green-600" />,
    error: <XCircle className="w-6 h-6 text-red-600" />,
    info: <Info className="w-6 h-6 text-blue-600" />,
  }[type];

  const title = {
    success: 'Success',
    redirect: 'Success',
    error: 'Error',
    info: 'Information',
  }[type];

  const buttonText = type === 'redirect' ? 'Continue' : 'OK';

  return (
    <Dialog  open={open} onClose={() => onOpenChange(false)} className="relative z-50">
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex items-start space-x-4">
            {icon}
            <div className="flex-1">
              <DialogTitle as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                {title}
              </DialogTitle>
              <Description as="p" className="mt-2 text-sm text-gray-700">
                {message}
              </Description>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus-outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                type === 'error' 
                  ? 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600' 
                  : type === 'info'
                  ? 'bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600'
                  : 'bg-firefly-600 hover:bg-firefly-500 focus-visible:outline-firefly-600'
              }`}
              onClick={() => {
                onConfirm?.();
                onOpenChange(false);
              }}
            >
              {buttonText}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
