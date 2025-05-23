import { usePage } from '@inertiajs/react';
import { BannerData, YoutubeEmbed, OCDMetrics } from '@/types';
import YouTube from 'react-youtube';

export default function Banner() {
    const BannerData = usePage().props.banner as BannerData;
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
        <>
            <section style={{ backgroundImage: `url(${BannerData.image})` }} className="bg-cover bg-center bg-casal-700 py-20 px-4 text-center text-white" >
                {BannerData && (
                    <>
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-5xl font-bold mb-6">{BannerData.title}</h2>
                            <p className="text-xl mb-8">
                                {BannerData.description}
                            </p>
                        </div>
                        {YoutubeEmbed?.src && (
                            <div className="max-w-5xl mx-auto">
                                <div className="aspect-w-16 aspect-h-9">
                                    <YouTube videoId="nfpELa_Jqb0" opts={opts} />
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
                                {metrics.number_of_open_partner_opertunities}
                            </span>
                            <span className="mt-2 text-2xl">Open Partner Opportunities</span>
                        </div>
                    </div>
                </div> )}
            </section >
        </>
    );
}