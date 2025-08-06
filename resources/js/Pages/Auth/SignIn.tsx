import { Head } from '@inertiajs/react';
import FrontendLayout from '@/components/ui/layouts/frontend-layout';
import SignInForm from '@/components/ui/forms/SignInForm';

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
