import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Auth, User } from '@/types';
import { usePage } from '@inertiajs/react';

export default function Dashboard({
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {

    const { auth } = usePage<{ auth: Auth }>().props;
    const LinkCardClassName = "max-w-sm rounded overflow-hidden shadow-lg bg-firefly-500 hover:bg-firefly-600 text-white"
    return (
        <FrontendLayout>
            <Head title="Welcome" />
            <section id="features" className="px-4">
                <div className="mx-auto text-center">
                    {auth.user && (
                        <>
                            <div className="my-6 lg:my-12 container px-6 mx-auto flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-gray-300">
                                <div>
                                    <h4 className="text-2xl font-bold leading-tight text-gray-800 dark:text-gray-100">User section</h4>
                                </div>

                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                <Link href={route('user.request.create')} className={LinkCardClassName}>
                                    <div>
                                        <div className="px-6 py-4">
                                            <div className="font-bold text-xl mb-2">Submit new Request</div>
                                            <p className="text-base">
                                                Use this feature to submit a new capacity development request for training and workshops                                            </p>
                                        </div>
                                    </div>
                                </Link>
                                <Link href={route('user.request.list')} className={LinkCardClassName}>
                                    <div>
                                        <div className="px-6 py-4">
                                            <div className="font-bold text-xl mb-2">List of My Requests</div>
                                            <p className="text-base">
                                                Use this feature to track the progress and current status of your submitted request.                                            </p>
                                        </div>
                                    </div>
                                </Link>
                                <Link href={route('user.opportunity.list')} className={LinkCardClassName}>
                                    <div>
                                        <div className="px-6 py-4">
                                            <div className="font-bold text-xl mb-2">View and Apply for Partner Opportunities</div>
                                            <p className="text-base">
                                                Use this feature to track the progress and current status of your submitted request.
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                            </div>
                        </>
                    )}
                    {auth.user.is_partner && (
                        <>
                            <div className="my-6 lg:my-12 container px-6 mx-auto flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-gray-300">
                                <div>
                                    <h4 className="text-2xl font-bold leading-tight text-gray-800 dark:text-gray-100">Partner section</h4>
                                </div>

                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                <Link href={route("partner.opportunity.create")} className={LinkCardClassName}>
                                    <div className="px-6 py-4">
                                        <div className="font-bold text-xl mb-2">Submit Opportunity</div>
                                        <p className="text-base">
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
                                        </p>
                                    </div>
                                </Link>
                                <Link href={route("partner.request.list")} className={LinkCardClassName}>
                                    <div className="px-6 py-4">
                                        <div className="font-bold text-xl mb-2">View Request for Training workshops</div>
                                        <p className="text-base">
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
                                        </p>
                                    </div>
                                </Link>
                                <div className={LinkCardClassName}>
                                    <div className="px-6 py-4">
                                        <div className="font-bold text-xl mb-2">My matched requests</div>
                                        <p className="text-base">
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
                                        </p>
                                    </div>
                                </div>
                                <Link href={route("partner.opportunity.list")} className={LinkCardClassName}>
                                    <div className="px-6 py-4">
                                        <div className="font-bold text-xl mb-2">View My submited Opportunities</div>
                                        <p className="text-base">
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </FrontendLayout>
    );
}
