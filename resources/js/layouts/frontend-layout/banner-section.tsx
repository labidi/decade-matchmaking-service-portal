import {usePage} from '@inertiajs/react';
import React, {useState} from 'react';
import YouTube from 'react-youtube';
import { OpportunitiesDialog } from '@features/opportunities';
import {Opportunity} from '@/types';
import {CursorArrowRaysIcon} from '@heroicons/react/16/solid';

export interface Banner {
    title: string;
    description: string;
    image: string;
}

export interface OCDMetrics {
    number_successful_matches: number;
    number_fully_closed_matches: number;
    number_user_requests_in_implementation: number;
    committed_funding_amount: number;
    number_of_open_partner_opportunities: number;
}

export interface YoutubeEmbed {
    title: string;
    src: string;
}

interface BannerSectionProps {
    bannerConfiguration?: Banner;
    YoutubeEmbed?: YoutubeEmbed;
    metrics?: OCDMetrics;
    recentOpportunities?: Opportunity[];
}

export default function BannerSection({
                                          bannerConfiguration,
                                          YoutubeEmbed,
                                          metrics,
                                          recentOpportunities
                                      }: Readonly<BannerSectionProps>) {
    const [showOpportunitiesDialog, setShowOpportunitiesDialog] = useState(false);

    const pageBannerConfiguration = bannerConfiguration ?? usePage().props.banner as Banner;
    const pageYoutubeEmbed = YoutubeEmbed ?? usePage().props.YoutubeEmbed as YoutubeEmbed;
    const pageMetrics = metrics ?? usePage().props.metrics as OCDMetrics;
    const pageRecentOpportunities = recentOpportunities ?? usePage().props.recentOpportunities as Opportunity[];

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
        },
    };
    if (!pageBannerConfiguration?.image) {
        return null; // Return null if no banner configuration or image is provided
    }
    return (
        <section style={{backgroundImage: `url(${pageBannerConfiguration.image})`}}
                 className="bg-cover bg-center bg-casal-700 py-20 px-4 text-center text-white">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-5xl font-bold mb-6">Ocean Connector</h2>
                <p className="text-xl mb-8">
                    {pageBannerConfiguration.description}
                </p>
            </div>
            {pageYoutubeEmbed?.src && (
                <div className="max-w-5xl mx-auto">
                    <div className="aspect-video">
                        <YouTube videoId={pageYoutubeEmbed.src} opts={opts} className="inset-0 w-full h-full"/>
                    </div>
                </div>
            )}
            {pageMetrics && (
                <div className="py-20 px-4">
                    <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 text-white sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                        <div className="flex flex-col gap-y-3 border-l border-white pl-6">
                            <span className="block text-5xl font-bold">
                                {pageMetrics.number_successful_matches}
                            </span>
                            <span className="mt-2 text-2xl">Successful Matches</span>
                        </div>
                        <div className="flex flex-col gap-y-3 border-l border-white pl-6">
                            <span className="block text-5xl font-bold">
                                {pageMetrics.number_fully_closed_matches}
                            </span>
                            <span className="mt-2 text-2xl">Completed Trainings & Workshops</span>
                        </div>
                        <div className="flex flex-col gap-y-3 border-l border-white pl-6">
                            <span className="block text-5xl font-bold">
                                {pageMetrics.number_user_requests_in_implementation}
                            </span>
                            <span className="mt-2 text-2xl">Requests in Implementation</span>
                        </div>
                        <div className="flex flex-col gap-y-3 border-l border-white pl-6">
                            <span className="block text-5xl font-bold">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    maximumFractionDigits: 0,
                                }).format(pageMetrics.committed_funding_amount)}
                            </span>
                            <span className="mt-2 text-2xl">Committed Funding</span>
                        </div>
                        <div className="flex flex-col gap-y-3 border-l border-white pl-6">
                            <button
                                onClick={() => setShowOpportunitiesDialog(true)}
                                className="hover:opacity-80 transition-opacity"
                                title="Click here to preview open capacity development opportunities"
                            >
                            <span className="block text-5xl font-bold">
                                {pageMetrics.number_of_open_partner_opportunities}
                            </span>
                                <span className="mt-2 text-2xl">
                               <span aria-hidden="true">→</span> Click here to preview open capacity development opportunities
                            </span>
                            </button>
                        </div>
                    </dl>
                </div>
            )}

            {
                pageRecentOpportunities && (
                    <OpportunitiesDialog
                        open={showOpportunitiesDialog}
                        onClose={() => setShowOpportunitiesDialog(false)}
                        opportunities={pageRecentOpportunities}
                    />
                )
            }
        </section>
    )
        ;
}
