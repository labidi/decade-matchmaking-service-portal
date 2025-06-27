import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { Auth, User } from '@/types';
import { usePage } from '@inertiajs/react';

export default function Home({
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {

    const { auth } = usePage<{ auth: Auth }>().props;
    const LinkRequestCardClassName = "max-w-sm rounded overflow-hidden shadow-lg bg-firefly-900 hover:bg-firefly-600 text-white"
    const LinkOpportunityCardClassName = "max-w-sm rounded overflow-hidden shadow-lg bg-firefly-500 hover:bg-firefly-600 text-white"
    return (
        <FrontendLayout>
            <Head title="Welcome" />
            <section id="features" className="px-4">
                <div className="mx-auto text-center">

                    <div className="my-6 lg:my-12 container px-6 mx-auto flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-gray-300">
                        <div>
                            <h4 className="text-2xl font-bold leading-tight text-gray-800 dark:text-gray-100">Request section</h4>
                        </div>

                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {auth.user && (
                            <Link href={route('user.request.create')} className={LinkRequestCardClassName}>
                                <div>
                                    <div className="px-6 py-4">
                                        <div className="font-bold text-xl mb-2">Submit new Request</div>
                                        <p className="text-base">
                                            Use this feature to submit a new capacity development request for training and workshops                                            </p>
                                    </div>
                                </div>
                            </Link>
                        )}
                        {auth.user && (
                            <Link href={route('request.me.list')} className={LinkRequestCardClassName}>
                                <div>
                                    <div className="px-6 py-4">
                                        <div className="font-bold text-xl mb-2">List of My Requests</div>
                                        <p className="text-base">
                                            Use this feature to track the progress and current status of your submitted request.                                            </p>
                                    </div>
                                </div>
                            </Link>
                        )}
                        {auth.user && auth.user.is_partner && (
                            <Link href={route("partner.request.list")} className={LinkRequestCardClassName}>
                                <div className="px-6 py-4">
                                    <div className="font-bold text-xl mb-2">View Request for Training & Workshops</div>
                                    <p className="text-base">
                                        Browse and explore training and workshop requests that align with your interests and expertise as a Partner
                                    </p>
                                </div>
                            </Link>
                        )}
                        {auth.user && auth.user.is_partner && (
                            <Link href={route('request.me.matchedrequests')} className={LinkRequestCardClassName}>
                                <div className="px-6 py-4">
                                    <div className="font-bold text-xl mb-2">My matched requests</div>
                                    <p className="text-base">
                                        Manage training and workshop requests that you matched with as a Partner                                        </p>
                                </div>
                            </Link>
                        )}


                    </div>
                    <div className="my-6 lg:my-12 container px-6 mx-auto flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-gray-300">
                        <div>
                            <h4 className="text-2xl font-bold leading-tight text-gray-800 dark:text-gray-100">Opportunity section</h4>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {auth.user && (
                            <Link href={route('opportunity.list')} className={LinkOpportunityCardClassName}>
                                <div>
                                    <div className="px-6 py-4">
                                        <div className="font-bold text-xl mb-2">View and Apply for Partner Opportunities</div>
                                        <p className="text-base">
                                            Browse and apply for available capacity development opportunities offered by partners of CDF                                            </p>
                                    </div>
                                </div>
                            </Link>
                        )}
                        {auth.user && auth.user.is_partner && (
                            <Link href={route("partner.opportunity.create")} className={LinkOpportunityCardClassName}>
                                <div className="px-6 py-4">
                                    <div className="font-bold text-xl mb-2">Submit Opportunity</div>
                                    <p className="text-base">
                                        Submit a new capacity development opportunity as an User.
                                    </p>
                                </div>
                            </Link>

                        )}
                        {auth.user && auth.user.is_partner && (
                            <Link href={route("opportunity.me.list")} className={LinkOpportunityCardClassName}>
                                <div className="px-6 py-4">
                                    <div className="font-bold text-xl mb-2">View My submited Opportunities</div>
                                    <p className="text-base">
                                        View the capacity development opportunity you have submitted as a Partner                                        </p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
