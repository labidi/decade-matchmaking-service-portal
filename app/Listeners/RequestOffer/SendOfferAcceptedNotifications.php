<?php

declare(strict_types=1);

namespace App\Listeners\RequestOffer;

use App\Events\OfferAccepted;
use App\Jobs\Email\SendTransactionalEmail;
use App\Models\User;
use App\Services\SystemNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener for OfferAccepted event.
 *
 * Handles:
 * - Notifying administrators
 * - Notifying the partner who made the offer
 * - Notifying the request owner (confirmation)
 */
class SendOfferAcceptedNotifications implements ShouldQueue
{
    public function __construct(
        private readonly SystemNotificationService $systemNotificationService
    )
    {
    }

    /**
     * Handle the event.
     *
     * @param OfferAccepted $event The offer accepted event
     * @return void
     */
    public function handle(OfferAccepted $event): void
    {
        $offer = $event->offer;
        $acceptedBy = $event->acceptedBy;

        // Eager load relationships to prevent N+1 queries
        $offer->load(['request.user', 'matchedPartner']);

        $this->systemNotificationService->notifyAdmins(
            'Accepted Offer for a request',
            sprintf(
                'User <span class="font-bold">%s</span> has accepted offer for request <a href="%s" target="_blank" class="font-bold underline">%s</a> ',
                $acceptedBy->name,
                route('admin.request.show', ['id' => $offer->request->id]),
                $offer->request->detail->capacity_development_title
            )
        );
        try {
            $recipients = [];

            // Notify administrators
            $admins = User::where('administrator', true)->get();
            foreach ($admins as $admin) {
                $recipients[] = [
                    'user' => $admin,
                    'type' => 'admin',
                ];
            }

            // Notify the partner who made the offer
            if ($offer->matchedPartner) {
                $recipients[] = [
                    'user' => $offer->matchedPartner,
                    'type' => 'partner',
                ];
            }

            // Notify the request owner (confirmation)
            if ($acceptedBy) {
                $recipients[] = [
                    'user' => $acceptedBy,
                    'type' => 'requester',
                ];
            }

            // Send emails to all recipients
            foreach ($recipients as $recipient) {
                dispatch(new SendTransactionalEmail(
                    'offer.accepted',
                    $recipient['user'],
                    [
                        'Offer_ID' => $offer->id,
                        'Request_Title' => $offer->request->capacity_development_title ?? 'N/A',
                        'Request_Link' => route('request.public.show', $offer->request_id),
                        'Partner_Name' => $offer->matchedPartner?->name ?? 'N/A',
                        'Accepted_By' => $acceptedBy->name ?? 'N/A',
                        'user_name' => $recipient['user']->name,
                        'recipient_type' => $recipient['type'],
                        'UNSUB' => route('unsubscribe.show', $recipient['user']->id),
                        'UPDATE_PROFILE' => route('notification.preferences.index'),
                    ]
                ));
            }
        } catch (\Exception $e) {
            Log::error('Failed to send offer accepted notifications', [
                'offer_id' => $offer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
