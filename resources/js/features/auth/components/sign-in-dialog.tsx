import React from 'react';
import {Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle} from '@ui/primitives/dialog'
import { SignInForm } from '@ui/organisms/forms';
import {useState} from 'react';

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
            <Dialog size="xl" open={isOpen} onClose={setIsOpen}>
                <DialogTitle>Sign In</DialogTitle>
                <DialogDescription>
                    Enter your OceanExpert credentials to access the portal.
                </DialogDescription>
                <DialogBody>
                    <SignInForm/>
                </DialogBody>
            </Dialog>
        </div>
    );
}
