import {PageProps} from '@/types';
import {Head} from '@inertiajs/react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import {Auth, User} from '@/types';
import {usePage} from '@inertiajs/react';
import CardLink from '@/Components/Home/CardLink';
import SectionTitle from '@/Components/Home/SectionTitle';
import CardGuide from '@/Components/Home/CardGuide';

export default function Home({}: PageProps<{ laravelVersion: string; phpVersion: string }>) {

    const {auth} = usePage<{ auth: Auth }>().props;
    const LinkRequestCardClassName = "max-w-sm rounded overflow-hidden shadow-lg bg-firefly-900 hover:bg-firefly-600 text-white"
    const LinkOpportunityCardClassName = "max-w-sm rounded overflow-hidden shadow-lg bg-firefly-500 hover:bg-firefly-600 text-white"

    return (
        <FrontendLayout>
            <Head title="Welcome"/>
            <section className="text-gray-600 body-font">
                <div className="container px-5 py-5 mx-auto flex flex-wrap">
                    <div className="flex flex-wrap -m-4">
                        {auth.user.is_partner ? (
                            <>
                                <div className="p-4 lg:w-1/2 md:w-full">
                                    <CardGuide
                                        title="Partner guide"
                                        description="A step-by-step guide to help Partners use the Matchmaking Platform, review requests, and submit opportunities."
                                        fileUrl="/assets/pdf/partner-guide.pdf"
                                    />
                                </div>
                                <div className="p-4 lg:w-1/2 md:w-full">
                                    <CardGuide
                                        title="User guide"
                                        description="A step-by-step guide to help Users navigate the Matchmaking Platform, submit requests, and engage with partner opportunities."
                                        fileUrl="/assets/pdf/user-guide.pdf"
                                    />
                                </div>
                            </>


                        ) : (
                            <div className="p-4 lg:w-full md:w-full">
                                <CardGuide
                                    title="User guide"
                                    description="A step-by-step guide to help Users navigate the Matchmaking Platform, submit requests, and engage with partner opportunities."
                                    fileUrl="/assets/pdf/user-guide.pdf"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <section id="features" className="px-4">
                <div className="mx-auto text-center">
                    <SectionTitle>Request section</SectionTitle>

                    <div className="grid md:grid-cols-3 gap-8">
                        {auth.user && (
                            <CardLink
                                link={route('request.create')}
                                className={LinkRequestCardClassName}
                                title="Submit new Request"
                                text="Use this feature to submit a new capacity development request for training and workshops "
                            />
                        )}
                        {auth.user && (
                            <CardLink
                                link={route('request.me.list')}
                                className={LinkRequestCardClassName}
                                title="List of My Requests"
                                text="Use this feature to track the progress and current status of your submitted request. "
                            />
                        )}
                        {auth.user && auth.user.is_partner && (
                            <CardLink
                                link={route('partner.request.list')}
                                className={LinkRequestCardClassName}
                                title="View Request for Training & Workshops"
                                text="Browse and explore training and workshop requests that align with your interests and expertise as a Partner"
                            />
                        )}
                        {auth.user && auth.user.is_partner && (
                            <CardLink
                                link={route('request.me.matched-requests')}
                                className={LinkRequestCardClassName}
                                title="My matched requests"
                                text="Manage training and workshop requests that you matched with as a Partner "
                            />
                        )}
                    </div>
                    <SectionTitle>Opportunity section</SectionTitle>

                    <div className="grid md:grid-cols-3 gap-8">
                        {auth.user && (
                            <CardLink
                                link={route('opportunity.list')}
                                className={LinkOpportunityCardClassName}
                                title="View and Apply for Partner Opportunities"
                                text="Browse and apply for available capacity development opportunities offered by partners of CDF "
                            />
                        )}
                        {auth.user && auth.user.is_partner && (
                            <CardLink
                                link={route('partner.opportunity.create')}
                                className={LinkOpportunityCardClassName}
                                title="Submit Opportunity"
                                text="Submit a new capacity development opportunity as an User."
                            />
                        )}
                        {auth.user && auth.user.is_partner && (
                            <CardLink
                                link={route('opportunity.me.list')}
                                className={LinkOpportunityCardClassName}
                                title="View My submited Opportunities"
                                text="View the capacity development opportunity you have submitted as a Partner "
                            />
                        )}
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}
