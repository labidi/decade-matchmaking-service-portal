import {PageProps} from '@/types';
import {Head} from '@inertiajs/react';
import { FrontendLayout } from '@layouts/index';
import {Auth, User} from '@/types';
import {usePage} from '@inertiajs/react';
import { CardLink, SectionTitle, CardGuide } from '@features/home';

type HomePageProps = {
    userGuide?: string;
    partnerGuide?: string;
}
export default function Home({userGuide, partnerGuide}: Readonly<HomePageProps>) {

    const {auth} = usePage<{ auth: Auth }>().props;
    const LinkRequestCardClassNameDisabled = "max-w-sm rounded overflow-hidden shadow-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-700 text-white"
    const LinkRequestCardClassName = "max-w-sm rounded overflow-hidden shadow-lg bg-firefly-900 dark:bg-firefly-950 hover:bg-firefly-600 dark:hover:bg-firefly-700 text-white"
    const LinkOpportunityCardClassName = "max-w-sm rounded overflow-hidden shadow-lg bg-firefly-500 dark:bg-firefly-600 hover:bg-firefly-600 dark:hover:bg-firefly-700 text-white"

    // Helper function to check if user has access (either is_user or is_partner)
    const userHasAccess = (user: User): boolean => user.is_user || user.is_partner;

    return (
        <FrontendLayout>
            <Head title="Welcome"/>
            <section className="text-gray-600 dark:text-gray-300 body-font">
                <div className="container px-5 py-5 mx-auto flex flex-wrap">
                    <div className="flex flex-wrap -m-4">
                        {auth.user.is_partner ? (
                            <>
                                {partnerGuide && (
                                    <div className="p-4 lg:w-1/2 md:w-full">

                                        <CardGuide
                                            title="Partner guide"
                                            description="A step-by-step guide to help Partners use the Ocean connector, review requests, and submit opportunities."
                                            fileUrl={partnerGuide}
                                        />
                                    </div>
                                )}
                                {userGuide && (
                                    <div className="p-4 lg:w-1/2 md:w-full">

                                        <CardGuide
                                            title="User guide"
                                            description="A step-by-step guide to help Users navigate the Ocean connector, submit requests, and engage with partner opportunities."
                                            fileUrl={userGuide}
                                        />
                                    </div>
                                )}
                            </>


                        ) : (
                            <div className="p-4 lg:w-full md:w-full">
                                {userGuide && (
                                    <div className="p-4 lg:w-1/2 md:w-full">

                                        <CardGuide
                                            title="User guide"
                                            description="A step-by-step guide to help Users navigate the Oceanconnector Platform, submit requests, and engage with partner opportunities."
                                            fileUrl={userGuide}
                                        />
                                    </div>
                                )}
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
                                className={userHasAccess(auth.user) ? LinkRequestCardClassName : LinkRequestCardClassNameDisabled}
                                title="Submit new Request"
                                text="Use this feature to submit a new capacity development request for training and workshops "
                                disabled={!userHasAccess(auth.user)}
                            />
                        )}
                        {auth.user && (
                            <CardLink
                                link={route('request.me.list')}
                                className={userHasAccess(auth.user) ? LinkRequestCardClassName : LinkRequestCardClassNameDisabled}
                                title="List of My Requests"
                                text="Use this feature to track the progress and current status of your submitted request. "
                                disabled={!userHasAccess(auth.user)}
                            />
                        )}
                        {auth.user && auth.user.is_partner && (
                            <CardLink
                                link={route('request.list')}
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
                        {auth.user && (
                            <CardLink
                                link={route('request.me.matched-requests')}
                                className={userHasAccess(auth.user) ? LinkRequestCardClassName : LinkRequestCardClassNameDisabled}
                                title="My Subscribed requests"
                                text="Manage and keep track of the requests you have subscribed to for updates and notifications."
                                disabled={!userHasAccess(auth.user)}
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
                                link={route('opportunity.create')}
                                className={LinkOpportunityCardClassName}
                                title="Submit Opportunity"
                                text="Submit a new capacity development opportunity as a Partner."
                            />
                        )}
                        {auth.user && auth.user.is_partner && (
                            <CardLink
                                link={route('me.opportunity.list')}
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
