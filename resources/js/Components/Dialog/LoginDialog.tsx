// resources/js/Components/LoginDialog.tsx
import React from 'react';
import { Dialog } from "radix-ui";
import { useForm } from '@inertiajs/react';
import { InputField } from '@/Components/FormFields';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';

export default function LoginDialog() {
  const form = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(route('login.post'), {
      onSuccess: () => {
        // close dialog or handle success
      },
    });
  };

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
          <Dialog.Title className="text-xl font-semibold mb-4">Login to Your Account</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 mb-6">
            Enter your OceanExpert credentials to access the portal.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              form={form}
              name="email"
              type="email"
              label="Email address"
              description="We'll never share your email."
              required
            />
            <InputField
              form={form}
              name="password"
              type="password"
              label="Password"
              description="Enter your secure password."
              required
            />

            <div className="flex items-center space-x-2">
                <Checkbox.Root
                id="remember"
                checked={form.data.remember}
                onCheckedChange={val => {
                  if (val === true) {
                  form.setData('remember', true);
                  } else {
                  form.setData('remember', false);
                  }
                }}
                className="w-5 h-5 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-firefly-500 flex items-center justify-center"
                >
                <Checkbox.Indicator>
                  <CheckIcon className="w-4 h-4 text-firefly-600" />
                </Checkbox.Indicator>
                </Checkbox.Root>
              <label htmlFor="remember" className="text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Dialog.Close asChild>
                <button type="button" className="px-4 py-2 border rounded hover:bg-gray-100">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={form.processing}
                className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700"
              >
                {form.processing ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
