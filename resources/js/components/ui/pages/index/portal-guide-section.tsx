import {usePage} from '@inertiajs/react';
import {PortalGuide} from '@/types';

interface UserGuideSectionProps {
    portalGuide: PortalGuide;
}

export default function PortalGuideSection({portalGuide}: Readonly<UserGuideSectionProps>) {
    return (
        <section className="bg-casal-900 py-20 px-4 text-center text-white shadow-lg rounded-xl" >
            <div className="max-w-4xl mx-auto">
                        <span className="text-2xl mb-8">
                            <a href={route('user.guide')} className="text-white underline hover:text-casal-300">
                                New to the platform? Read this to see how it works and how you can get involved.
                            </a>
                        </span>
            </div>
            <section className="max-w-6xl mx-auto py-10">
                <div className=" bg-firefly-900">
                    <div
                        className="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden"
                        title="Woman holding a mug">
                    </div>
                    <div className=" p-4 flex flex-col leading-normal">
                        <div className="mb-8">
                            <p className="text-white text-2xl">
                                Do you have a capacity development gap that needs to be addressed? <br/>
                                Log in to submit a request for training or workshops, or explore currently available
                                opportunities offered by CDF Partners. <br/>
                            </p>
                            <p className="text-white text-2xl py-4">
                                Are you part of an organization that provides capacity development services? <br/>
                                Looking to expand your reach or promote your activities? This platform is the right
                                place for you. <br/>
                                As a partner, you can both view training needs and submit your own
                                opportunities. <br/>
                                To get started, contact cdf@unesco.org to become a partner.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
}
