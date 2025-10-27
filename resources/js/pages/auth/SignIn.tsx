import { Head } from '@inertiajs/react';
import { FrontendLayout } from '@layouts/index';
import { SignInForm } from '@ui/organisms/forms';

export default function SignIn() {
    return (
        <FrontendLayout>
            <Head title="Welcome" />
            <div className="max-w-lg  mx-auto mt-8 p-6">
                <SignInForm />
            </div>
        </FrontendLayout>
    );
}
