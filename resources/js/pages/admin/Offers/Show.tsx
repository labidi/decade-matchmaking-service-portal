import React from 'react';
import {Head, router} from '@inertiajs/react';
import {SidebarLayout} from '@layouts/index';
import {RequestOffer, Document} from '@/types';
import {Button} from '@ui/primitives/button';
import {Badge} from '@ui/primitives/badge';
import {formatDate, offerStatusBadgeRenderer} from '@shared/utils';
import {OfferActionButtons} from '@features/offers/components/offer-action-buttons';
import {
    OfferDetailsCard,
} from '@features/requests/components/show';
import {Heading} from "@ui/primitives";

interface ShowOfferPageProps {
    offer: RequestOffer;
}


export default function ShowOffer({offer}: Readonly<ShowOfferPageProps>) {

    return (
        <SidebarLayout>
            <Head title={`Offer #${offer.id}`}/>
            <div className="mx-auto">
                <Heading level={1}>
                    {`Offer #${offer.id}`}
                </Heading>
                <hr className="my-2 border-zinc-200 dark:border-zinc-700"/>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Created {formatDate(offer.created_at)}
                    </p>
                </div>
            </div>
            <div className="py-8">
                <OfferDetailsCard offer={offer}/>
            </div>
        </SidebarLayout>
    );
}
