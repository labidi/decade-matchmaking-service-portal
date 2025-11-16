<?php

declare(strict_types=1);

namespace App\Listeners\Request;

use App\Events\Request\RequestStatusChanged;
use App\Jobs\Email\SendTransactionalEmail;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Listener for RequestStatusChanged event.
 *
 * Handles:
 * - Notifying request creator (always)
 * - Notifying matched partner (if exists)
 * - Notifying admins (for specific statuses)
 */
class SendRequestStatusChangedNotifications implements ShouldQueue
{
    public function handle(RequestStatusChanged $event): void
    {
        $request = $event->request;
        $previousStatus = $event->previousStatus;
        // Eager load relationships to prevent N+1 queries
        $request->load(['user', 'matchedPartner', 'status']);

        dispatch(new SendTransactionalEmail(
            'request.status.changed',
            $request->user,
            [
                'Request_Title' => $request->detail->capacity_development_title,
                'Request_Status' => $request->status->status_label,
                'Link_to_Request' => route('request.me.show', $request->id),
                'UNSUB' => route('unsubscribe.show', $request->user->id),
                'UPDATE_PROFILE' => route('notification.preferences.index'),
            ]
        ));
    }
}
