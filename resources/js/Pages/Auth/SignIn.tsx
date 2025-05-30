import { Head } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import SignInForm from '@/Components/SignInForm';   

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
