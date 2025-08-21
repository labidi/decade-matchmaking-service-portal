import {usePage} from '@inertiajs/react';
import YouTube from 'react-youtube';

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
}

export default function BannerSection({bannerConfiguration, YoutubeEmbed, metrics}: Readonly<BannerSectionProps>) {

    const pageBannerConfiguration = bannerConfiguration ?? usePage().props.banner as Banner;
    const pageYoutubeEmbed = YoutubeEmbed ?? usePage().props.YoutubeEmbed as YoutubeEmbed;
    const pageMetrics = metrics ?? usePage().props.metrics as OCDMetrics;

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
                <h2 className="text-5xl font-bold mb-6">Capacity Development Matchmaking Platform</h2>
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
                    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-center">
                        <div>
                            <span className="block text-5xl font-bold">
                                {pageMetrics.number_successful_matches}
                            </span>
                            <span className="mt-2 text-2xl">Successful Matches</span>
                        </div>
                        <div>
                            <span className="block text-5xl font-bold">
                                {pageMetrics.number_fully_closed_matches}
                            </span>
                            <span className="mt-2 text-2xl">Fully Closed Matches</span>
                        </div>
                        <div>
                            <span className="block text-5xl font-bold">
                                {pageMetrics.number_user_requests_in_implementation}
                            </span>
                            <span className="mt-2 text-2xl">Requests in Implementation</span>
                        </div>
                        <div>
                            <span className="block text-5xl font-bold">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    maximumFractionDigits: 0,
                                }).format(pageMetrics.committed_funding_amount)}
                            </span>
                            <span className="mt-2 text-2xl">Committed Funding</span>
                        </div>
                        <div>
                            <span className="block text-5xl font-bold">
                                {pageMetrics.number_of_open_partner_opportunities}
                            </span>
                            <span className="mt-2 text-2xl">Open Partner Opportunities</span>
                        </div>
                    </div>
                </div>)}
        </section>
    );
}
