import React from 'react';
import { Dialog } from "radix-ui";
import SignInForm from '../SignInForm';

export default function SignInDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="px-4 py-2 bg-white text-black rounded hover:bg-firefly-700">
          Login
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-firefly-600/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-md bg-white p-6 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title className="text-2xl font-semibold mb-4">Login to Your Account</Dialog.Title>
          <Dialog.Description className="text-xl text-gray-600 mb-6">
            Enter your OceanExpert credentials to access the portal.
          </Dialog.Description>
          <SignInForm />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
