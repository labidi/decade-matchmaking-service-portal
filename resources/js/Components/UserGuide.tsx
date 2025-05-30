import { usePage, Link } from '@inertiajs/react';
import { UserGuideFile } from '@/types';

export default function UserGuide() {
    const UserGuideFile = usePage().props.userguide as UserGuideFile;
    return (
        <>
            {UserGuideFile && (
                <section className="bg-casal-800 py-20 px-4 text-center text-white">
                    <div className="max-w-4xl mx-auto">
                        <span className="text-xl mb-8">
                            <a href={route('user.guide')} className="text-white underline hover:text-casal-300">
                                New to the platform? Read this to see how it works and how you can get involved.
                            </a>
                        </span>
                    </div>
                </section>
            )}
        </>
    );
}