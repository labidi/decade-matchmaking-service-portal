import React from 'react';
import {useForm} from '@inertiajs/react';
import {FormEventHandler} from 'react';
import {Checkbox, CheckboxField} from '@ui/primitives/checkbox'
import {Label} from '@ui/primitives/fieldset'
import {FieldRenderer} from '@ui/organisms/forms';
import {UIField} from '@/types';

interface LoginProps {
    status?: string;
}

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function SignInForm({status}: Readonly<LoginProps>) {

    const UISignInForm: { email: UIField; password: UIField } = {
        email: {
            id: 'email',
            type: 'email',
            label: 'Email address',
            description: "We'll never share your email.",
            required: true,
            placeholder: 'Enter your email address'
        },
        password: {
            id: 'password',
            type: 'password',
            label: 'Password',
            description: 'Enter your secure password.',
            required: true,
            placeholder: 'Enter your password'
        }
    };

    const {data, setData, post, processing, errors, reset} = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const handleFieldChange = (name: string, value: any) => {
        setData(name as keyof LoginForm, value);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('sign.in.post'), {
            onFinish: () => {
                reset('password');
            }
        });
    };

    return (
        <div className="mt-10 sm:mx-auto sm:w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
                <FieldRenderer
                    name="email"
                    field={UISignInForm.email}
                    value={data.email}
                    error={errors.email}
                    onChange={handleFieldChange}
                    formData={data}
                    className="space-y-0"
                />

                <FieldRenderer
                    name="password"
                    field={UISignInForm.password}
                    value={data.password}
                    error={errors.password}
                    onChange={handleFieldChange}
                    formData={data}
                    className="space-y-0"
                />
                <CheckboxField>
                    <Checkbox
                        checked={data.remember}
                        onChange={checked => setData('remember', checked)}
                        name="remember"
                        id="remember"
                    />
                    <Label>Remember me</Label>
                </CheckboxField>
                <div className="flex justify-end space-x-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 bg-firefly-600 text-white rounded hover:bg-firefly-700"
                    >
                        {processing ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>
            </form>
        </div>

    );
}
