import { usePage } from '@inertiajs/react';
import { BannerData, YoutubeEmbed } from '@/types';
import YouTube from 'react-youtube';

export default function Banner() {
    const BannerData = usePage().props.banner as BannerData;
    const YoutubeEmbed = usePage().props.YoutubeEmbed as YoutubeEmbed;
    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
        },
    };
    return (
        <>
            {BannerData && (
                <section style={{ backgroundImage: `url(${BannerData.image})` }}
                    className="bg-cover bg-center bg-casal-700 py-20 px-4 text-center text-white">
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
                </section>
            )}
        </>
    );
}