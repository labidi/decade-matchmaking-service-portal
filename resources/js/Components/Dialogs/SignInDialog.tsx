import React from 'react';
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import SignInForm from '@/Components/Forms/SignInForm';
import { useState } from 'react';

export default function SignInDialog() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-white text-black rounded hover:bg-firefly-700"
            >
                Sign In
            </button>

            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
                <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
                <DialogPanel className="fixed inset-0 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <DialogTitle className="text-lg font-semibold mb-4">Sign In</DialogTitle>
                        <Description className="mb-4">Please enter your credentials to sign in.</Description>
                        <SignInForm />
                    </div>
                </DialogPanel>
            </Dialog>
        </div>
  );
}
