<?php

declare(strict_types=1);

namespace App\Events;

use App\Domains\User\Models\User;
use App\Models\Request\Offer;
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
    ) {}
}
