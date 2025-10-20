<?php

declare(strict_types=1);

namespace App\Listeners\RequestOffer;

use App\Events\RequestOffer\OfferRejected;
use App\Jobs\Email\SendTransactionalEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener for OfferRejected event.
 *
 * Handles:
 * - Notifying the partner who made the offer
 */
class SendOfferRejectedNotifications implements ShouldQueue
{
    /**
     * Handle the event.
     *
     * @param OfferRejected $event The offer rejected event
     * @return void
     */
    public function handle(OfferRejected $event): void
    {
        $offer = $event->offer;
        $rejectedBy = $event->rejectedBy;

        try {
            // Notify the partner who made the offer
            if ($offer->matchedPartner) {
                dispatch(new SendTransactionalEmail(
                    'offer.rejected',
                    $offer->matchedPartner,
                    [
                        'Offer_ID' => $offer->id,
                        'Request_Title' => $offer->request->capacity_development_title ?? 'N/A',
                        'Request_Link' => route('request.show', $offer->request_id),
                        'Rejected_By' => $rejectedBy->name ?? 'Request Owner',
                        'user_name' => $offer->matchedPartner->name,
                        'UNSUB' => route('unsubscribe.show', $offer->matchedPartner->id),
                        'UPDATE_PROFILE' => route('notification.preferences.index'),
                    ]
                ));
            }

            Log::info('Offer rejected notifications sent', [
                'offer_id' => $offer->id,
                'request_id' => $offer->request_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send offer rejected notifications', [
                'offer_id' => $offer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
