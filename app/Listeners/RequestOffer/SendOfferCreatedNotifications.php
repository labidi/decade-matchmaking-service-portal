<?php

declare(strict_types=1);

namespace App\Listeners\RequestOffer;

use App\Events\RequestOffer\OfferCreated;
use App\Jobs\Email\SendTransactionalEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener for OfferCreated event.
 *
 * Handles:
 * - Notifying request owner about new offer
 * - Notifying admins (optional)
 */
class SendOfferCreatedNotifications implements ShouldQueue
{
    /**
     * Handle the event.
     *
     * @param OfferCreated $event The offer created event
     * @return void
     */
    public function handle(OfferCreated $event): void
    {
        $offer = $event->offer;

        // Eager load relationships to prevent N+1 queries
        $offer->load(['request.user', 'matchedPartner']);

        try {
            // Notify request owner
            if ($offer->request && $offer->request->user) {
                dispatch(new SendTransactionalEmail(
                    'offer.created',
                    $offer->request->user,
                    [
                        'Offer_ID' => $offer->id,
                        'Request_Title' => $offer->request->capacity_development_title ?? 'N/A',
                        'Request_Link' => route('request.show', $offer->request_id),
                        'Partner_Name' => $offer->matchedPartner?->name ?? 'Unknown Partner',
                        'user_name' => $offer->request->user->name,
                        'UNSUB' => route('unsubscribe.show', $offer->request->user->id),
                        'UPDATE_PROFILE' => route('notification.preferences.index'),
                    ]
                ));
            }

            Log::info('Offer created notifications sent', [
                'offer_id' => $offer->id,
                'request_id' => $offer->request_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send offer created notifications', [
                'offer_id' => $offer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
