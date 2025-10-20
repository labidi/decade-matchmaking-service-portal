<?php

declare(strict_types=1);

namespace App\Listeners\Request;

use App\Events\Request\RequestPartnerMatched;
use App\Jobs\Email\SendTransactionalEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener for RequestPartnerMatched event.
 *
 * Handles:
 * - Notifying request creator about the match
 * - Notifying the matched partner
 */
class SendRequestPartnerMatchedNotifications implements ShouldQueue
{
    /**
     * Handle the event.
     *
     * @param RequestPartnerMatched $event The request partner matched event
     * @return void
     */
    public function handle(RequestPartnerMatched $event): void
    {
        $request = $event->request;
        $partner = $event->partner;

        try {
            $recipients = [];

            // Notify the request creator
            if ($request->user) {
                $recipients[] = [
                    'user' => $request->user,
                    'type' => 'requester',
                ];
            }

            // Notify the matched partner
            $recipients[] = [
                'user' => $partner,
                'type' => 'partner',
            ];

            // Send emails to all recipients
            foreach ($recipients as $recipient) {
                dispatch(new SendTransactionalEmail(
                    'request.partner.matched',
                    $recipient['user'],
                    [
                        'Request_Title' => $request->capacity_development_title ?? 'N/A',
                        'Request_Link' => route('request.show', $request->id),
                        'user_name' => $recipient['user']->name,
                        'Partner_Name' => $partner->name,
                        'Partner_Email' => $partner->email,
                        'recipient_type' => $recipient['type'],
                        'UNSUB' => route('unsubscribe.show', $recipient['user']->id),
                        'UPDATE_PROFILE' => route('notification.preferences.index'),
                    ]
                ));
            }

            Log::info('Request partner matched notifications sent', [
                'request_id' => $request->id,
                'partner_id' => $partner->id,
                'recipient_count' => count($recipients),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send request partner matched notifications', [
                'request_id' => $request->id,
                'partner_id' => $partner->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
