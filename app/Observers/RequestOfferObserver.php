<?php

declare(strict_types=1);

namespace App\Observers;

use App\Events\OfferAccepted;
use App\Events\RequestOffer\OfferCreated;
use App\Events\RequestOffer\OfferDeleted;
use App\Models\Request\Offer;

/**
 * Observer for RequestOffer model.
 *
 * This observer follows the Single Responsibility Principle:
 * - Only checks conditions and dispatches events
 * - All business logic moved to event listeners
 */
class RequestOfferObserver
{
    /**
     * Handle the Offer "created" event.
     *
     * @param Offer $offer The newly created offer
     * @return void
     */
    public function created(Offer $offer): void
    {
        OfferCreated::dispatch($offer);
    }

    /**
     * Handle the Offer "updated" event.
     *
     * @param Offer $offer The updated offer
     * @return void
     */
    public function updated(Offer $offer): void
    {
        // Check if is_accepted changed from false to true
        if ($offer->isDirty('is_accepted') && $offer->is_accepted && ! $offer->getOriginal('is_accepted')) {
            $acceptedBy = $offer->request->user;
            if ($acceptedBy) {
                OfferAccepted::dispatch($offer, $acceptedBy);
            }
        }
    }

    /**
     * Handle the Offer "deleted" event.
     *
     * @param Offer $offer The offer being deleted
     * @return void
     */
    public function deleted(Offer $offer): void
    {
        OfferDeleted::dispatch($offer);
    }

    /**
     * Handle the Offer "restored" event.
     *
     * @param Offer $offer The restored offer
     * @return void
     */
    public function restored(Offer $offer): void
    {
        // No event needed for restoration currently
    }

    /**
     * Handle the Offer "force deleted" event.
     *
     * @param Offer $offer The force deleted offer
     * @return void
     */
    public function forceDeleted(Offer $offer): void
    {
        // No event needed for force deletion currently
    }
}
