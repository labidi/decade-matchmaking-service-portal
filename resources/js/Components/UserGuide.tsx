import { usePage } from '@inertiajs/react';
import { FileIcon } from "@radix-ui/react-icons"
import { UserGuideFile } from '@/types';

export default function UserGuide() {
    const UserGuideFile = usePage().props.userguide as UserGuideFile;
    return (
        <>
            {UserGuideFile && (
                <section className="bg-casal-800 py-20 px-4 text-center text-white">
                    <div className="max-w-4xl mx-auto">
                        <span className="text-xl mb-8">
                            New to the platform? Read this to see how it works and how you can get involved.  <FileIcon />
                        </span>
                    </div>
                </section>
            )}
        </>
    );
}