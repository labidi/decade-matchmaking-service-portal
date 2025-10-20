<?php

declare(strict_types=1);

namespace App\Events\Request;

use App\Models\Request;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event dispatched when a new request is created.
 *
 * This event is fired immediately after a request is persisted to the database.
 * Listeners should handle notifications to admins and confirmation emails to requesters.
 */
class RequestCreated
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param Request $request The newly created request
     */
    public function __construct(
        public readonly Request $request
    ) {
    }
}
