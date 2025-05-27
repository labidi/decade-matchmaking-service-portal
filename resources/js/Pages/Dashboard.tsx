import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';


export default function Dashboard({
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <FrontendLayout>
            <Head title="Welcome" />
            <section id="features" className="py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="grid md:grid-cols-3 gap-8">
                        <Link href={route('request.create')} className="max-w-sm rounded overflow-hidden shadow-lg">
                            <div>
                                <div className="px-6 py-4">
                                    <div className="font-bold text-xl mb-2">Submit new request</div>
                                    <p className="text-gray-700 text-base">
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
                                    </p>
                                </div>
                            </div>
                        </Link>
                        <Link href={route('request.list')} className="max-w-sm rounded overflow-hidden shadow-lg">
                            <div>
                                <div className="px-6 py-4">
                                    <div className="font-bold text-xl mb-2">List of My Requests</div>
                                    <p className="text-gray-700 text-base">
                                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
                                    </p>
                                </div>
                            </div>
                        </Link>
                        <div className="max-w-sm rounded overflow-hidden shadow-lg">
                            <div className="px-6 py-4">
                                <div className="font-bold text-xl mb-2">View and apply for Partner Opportunities</div>
                                <p className="text-gray-700 text-base">
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
