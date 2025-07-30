import {usePage} from '@inertiajs/react';
import {Banner, YoutubeEmbed, OCDMetrics} from '@/types';
import YouTube from 'react-youtube';

export default function BannerSection() {

    const bannerConfiguration = usePage().props.banner as Banner;
    const YoutubeEmbed = usePage().props.YoutubeEmbed as YoutubeEmbed;
    const metrics = usePage().props.metrics as OCDMetrics;

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
        },
    };
    return (
        <section style={{backgroundImage: `url(${bannerConfiguration.image})`}}
                 className="bg-cover bg-center bg-casal-700 py-20 px-4 text-center text-white">
            {bannerConfiguration && (
                <>
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-5xl font-bold mb-6">Capacity Development Matchmaking Platform</h2>
                        <p className="text-xl mb-8">
                            {bannerConfiguration.description}
                        </p>
                    </div>
                    {YoutubeEmbed?.src && (
                        <div className="max-w-5xl mx-auto">
                            <div className="aspect-video">
                                <YouTube videoId={YoutubeEmbed.src} opts={opts} className="inset-0 w-full h-full"/>
                            </div>
                        </div>
                    )}
                </>
            )}
            {metrics && (
                <div className="py-20 px-4">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-center">
                        <div>
                            <span className="block text-5xl font-bold">
                                {metrics.number_successful_matches}
                            </span>
                            <span className="mt-2 text-2xl">Successful Matches</span>
                        </div>
                        <div>
                            <span className="block text-5xl font-bold">
                                {metrics.number_fully_closed_matches}
                            </span>
                            <span className="mt-2 text-2xl">Fully Closed Matches</span>
                        </div>
                        <div>
                            <span className="block text-5xl font-bold">
                                {metrics.number_user_requests_in_implementation}
                            </span>
                            <span className="mt-2 text-2xl">Requests in Implementation</span>
                        </div>
                        <div>
                            <span className="block text-5xl font-bold">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    maximumFractionDigits: 0,
                                }).format(metrics.committed_funding_amount)}
                            </span>
                            <span className="mt-2 text-2xl">Committed Funding</span>
                        </div>
                        <div>
                            <span className="block text-5xl font-bold">
                                {metrics.number_of_open_partner_opportunities}
                            </span>
                            <span className="mt-2 text-2xl">Open Partner Opportunities</span>
                        </div>
                    </div>
                </div>)}
        </section>
    );
}
