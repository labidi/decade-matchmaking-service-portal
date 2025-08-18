<?php

namespace App\Events;

use App\Models\Request\Offer;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OfferAccepted
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public readonly Offer $offer,
        public readonly User $acceptedBy
    ) {
    }
}
