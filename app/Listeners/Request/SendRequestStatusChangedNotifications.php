<?php

declare(strict_types=1);

namespace App\Listeners\Request;

use App\Events\Request\RequestStatusChanged;
use App\Jobs\Email\SendTransactionalEmail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

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
                'Link_to_Request' => route('request.show', $request->id),
                'UNSUB' => route('unsubscribe.show', $request->user->id),
                'UPDATE_PROFILE' => route('notification.preferences.index'),
            ]
        ));

        return ;
        try {
            $recipients = [];
            $currentStatus = $request->status->status_label ?? 'Unknown';

            // Always notify the request creator
            if ($request->user) {
                $recipients[] = [
                    'user' => $request->user,
                    'type' => 'requester',
                ];
            }

            // Notify matched partner if exists
            if ($request->matchedPartner) {
                $recipients[] = [
                    'user' => $request->matchedPartner,
                    'type' => 'partner',
                ];
            }

            // Notify admins for certain status changes
            if ($this->shouldNotifyAdmins($request)) {
                $admins = User::where('administrator', true)->get();
                foreach ($admins as $admin) {
                    $recipients[] = [
                        'user' => $admin,
                        'type' => 'admin',
                    ];
                }
            }

            // Send emails to all recipients
            foreach ($recipients as $recipient) {
                dispatch(new SendTransactionalEmail(
                    'request.status.changed',
                    $recipient['user'],
                    [
                        'Request_Title' => $request->capacity_development_title ?? 'N/A',
                        'Request_Link' => route('request.show', $request->id),
                        'user_name' => $recipient['user']->name,
                        'Previous_Status' => $previousStatus ?? 'N/A',
                        'Current_Status' => $currentStatus,
                        'recipient_type' => $recipient['type'],
                        'UNSUB' => route('unsubscribe.show', $recipient['user']->id),
                        'UPDATE_PROFILE' => route('notification.preferences.index'),
                    ]
                ));
            }

        } catch (\Exception $e) {

        }
    }

    private function shouldNotifyAdmins(\App\Models\Request $request): bool
    {
        $notifyAdminStatuses = [
            'submitted',
            'under_review',
            'approved',
            'rejected',
            'completed',
        ];

        return in_array($request->status->status_code ?? '', $notifyAdminStatuses);
    }
}
