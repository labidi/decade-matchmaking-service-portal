import React from 'react';
import {useForm} from '@inertiajs/react';
import {FormEventHandler} from 'react';
import {Field, Label, Description, ErrorMessage} from '@/components/ui/fieldset'
import {Input} from '@/components/ui/input'
import {Checkbox, CheckboxField} from '@/components/ui/checkbox'

interface LoginProps {
    status?: string;
}

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function SignInForm({status}: LoginProps) {

    const UISignInForm = {
        email: {
            id: 'email',
            type: 'email',
            label: 'Email address',
            description: "We'll never share your email.",
            required: true,
        },
        password: {
            id: 'password',
            type: 'password',
            label: 'Password',
            description: 'Enter your secure password.',
            required: true,
        },
        rememberMe: {
            id: 'remember',
            type: 'checkbox',
            label: 'Remember me',
            description: 'Keep me signed in on this device.',
        },
    };

    const {data, setData, post, processing, errors, reset} = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

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
                <Field>
                    <Label htmlFor={UISignInForm.email.id} className="block font-medium">
                        {UISignInForm.email.label}{UISignInForm.email.required && ' *'}
                    </Label>
                    {UISignInForm.email.description &&
                        <Description>{UISignInForm.email.description}</Description>}
                    <Input
                        id={UISignInForm.email.id}
                        type={UISignInForm.email.type}
                        value={data["email"] ?? ''}
                        onChange={e => setData("email", e.currentTarget.value)}
                        required={UISignInForm.email.required}
                        className="mt-2 block w-full border-gray-300 rounded"
                        invalid={!!errors["email"]}
                    />
                    {errors["email"] && <ErrorMessage>{errors["email"]}</ErrorMessage>}
                </Field>

                <Field>
                    <Label htmlFor={UISignInForm.password.id} className="block font-medium">
                        {UISignInForm.password.label}{UISignInForm.password.required && ' *'}
                    </Label>
                    {UISignInForm.password.description &&
                        <Description>{UISignInForm.password.description}</Description>}
                    <Input
                        id={UISignInForm.password.id}
                        type={UISignInForm.password.type}
                        value={data["password"] ?? ''}
                        onChange={e => setData("password", e.currentTarget.value)}
                        required={UISignInForm.password.required}
                        className="mt-2 block w-full border-gray-300 rounded"
                        invalid={!!errors["password"]}
                    />
                    {errors["password"] && <ErrorMessage>{errors["password"]}</ErrorMessage>}
                </Field>
                <CheckboxField>
                    <Checkbox
                        checked={data.remember}
                        onChange={checked => setData('remember', checked)}
                        name="remember"
                        className="group block size-4 rounded border bg-white transition data-[checked]:bg-blue-500"
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

                <div className="relative mt-10">
                    <div aria-hidden="true" className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm/6 font-medium">
                        <span className="bg-white px-6 text-gray-900">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <button
                        className="flex items-center bg-white border border-gray-300 rounded-lg shadow-md max-w-xs px-6 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        <svg className="h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg"
                             xmlnsXlink="http://www.w3.org/1999/xlink"
                             viewBox="-0.5 0 48 48" version="1.1">

                            <g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="Color-" transform="translate(-401.000000, -860.000000)">
                                    <g id="Google" transform="translate(401.000000, 860.000000)">
                                        <path
                                            d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                                            id="Fill-1" fill="#FBBC05"></path>
                                        <path
                                            d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                                            id="Fill-2" fill="#EB4335"></path>
                                        <path
                                            d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                                            id="Fill-3" fill="#34A853"></path>
                                        <path
                                            d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                                            id="Fill-4" fill="#4285F4"></path>
                                    </g>
                                </g>
                            </g>
                        </svg>
                        <span>Continue with Google</span>
                    </button>
                    <button
                        className="flex items-center bg-white border border-gray-300 rounded-lg shadow-md max-w-xs px-6 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        <svg className="h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg"
                             xmlnsXlink="http://www.w3.org/1999/xlink"
                             viewBox="0 -2 44 44" version="1.1">
                            <g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="Color-" transform="translate(-702.000000, -265.000000)" fill="#007EBB">
                                    <path
                                        d="M746,305 L736.2754,305 L736.2754,290.9384 C736.2754,287.257796 734.754233,284.74515 731.409219,284.74515 C728.850659,284.74515 727.427799,286.440738 726.765522,288.074854 C726.517168,288.661395 726.555974,289.478453 726.555974,290.295511 L726.555974,305 L716.921919,305 C716.921919,305 717.046096,280.091247 716.921919,277.827047 L726.555974,277.827047 L726.555974,282.091631 C727.125118,280.226996 730.203669,277.565794 735.116416,277.565794 C741.21143,277.565794 746,281.474355 746,289.890824 L746,305 L746,305 Z M707.17921,274.428187 L707.117121,274.428187 C704.0127,274.428187 702,272.350964 702,269.717936 C702,267.033681 704.072201,265 707.238711,265 C710.402634,265 712.348071,267.028559 712.41016,269.710252 C712.41016,272.34328 710.402634,274.428187 707.17921,274.428187 L707.17921,274.428187 L707.17921,274.428187 Z M703.109831,277.827047 L711.685795,277.827047 L711.685795,305 L703.109831,305 L703.109831,277.827047 L703.109831,277.827047 Z"
                                        id="LinkedIn">

                                    </path>
                                </g>
                            </g>
                        </svg>
                        <span>Continue with LinkedIn</span>
                    </button>
                </div>
            </form>
        </div>

    );
}
