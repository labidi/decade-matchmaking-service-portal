import {usePage} from '@inertiajs/react';
import {PortalGuide} from '@/types';

interface UserGuideSectionProps {
    portalGuide: PortalGuide;
}

export default function PortalGuideSection({portalGuide}: Readonly<UserGuideSectionProps>) {
    return (
        <section className="bg-casal-900 py-20 px-4 text-center text-white shadow-lg rounded-xl">
            <div className="max-w-4xl mx-auto">
                        <span className="text-2xl mb-8">
                            <a href={portalGuide.url} target="_blank"
                               className="text-white underline hover:text-casal-300">
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
                                Want to see success stories from completed matches, trainings, and workshops supported
                                through the CDF? You can also access lessons-learned reports from the workshops and
                                trainings
                                <a href={'https://oceandecade.org/capacity-development-facility/'}
                                   target='_blank' className='inline underline underline-offset-4'> here </a>.
                                <br/>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
}
