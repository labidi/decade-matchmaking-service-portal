<?php

declare(strict_types=1);

namespace App\Listeners\Request;

use App\Events\Request\RequestValidated;
use App\Jobs\Email\SendTransactionalEmail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Listener for RequestValidated event.
 *
 * This listener handles instant email notifications when a request is validated/approved.
 * It sends emails to users who have matching subtheme preferences.
 *
 * NOTE: This is separate from the weekly newsletter system. This sends instant
 * notifications for validated requests matching user preferences.
 */
class SendRequestValidatedNotifications implements ShouldQueue
{
    /**
     * Handle the event.
     *
     * @param RequestValidated $event The request validated event
     * @return void
     */
    public function handle(RequestValidated $event): void
    {
        $request = $event->request;

        try {
            // Get request subthemes (stored as JSON array)
            $requestSubthemes = $request->request_data['subthemes'] ?? [];

            if (empty($requestSubthemes)) {
                Log::info('Request has no subthemes, skipping instant notifications', [
                    'request_id' => $request->id,
                ]);
                return;
            }

            // Opt-out model: notify partners who are subscribed (master switch on)
            // and have not opted out of at least one of this request's subthemes.
            $matchingUsers = User::role('partner')
                ->where('email_notifications_enabled', true)
                ->where('is_blocked', false)
                ->get()
                ->filter(function (User $user) use ($requestSubthemes) {
                    foreach ($requestSubthemes as $subtheme) {
                        if ($user->notificationEnabledFor('request', $subtheme)) {
                            return true;
                        }
                    }

                    return false;
                });

            if ($matchingUsers->isEmpty()) {
                Log::info('No users with matching subtheme preferences found', [
                    'request_id' => $request->id,
                    'subthemes' => $requestSubthemes,
                ]);
                return;
            }

            // Send email to each matching user
            $sentCount = 0;
            $skippedCount = 0;

            foreach ($matchingUsers as $user) {
                // Prevent duplicate notifications within 24 hours
                $cacheKey = "request_notification:{$request->id}:{$user->id}";

                if (Cache::has($cacheKey)) {
                    Log::debug('Skipping duplicate notification', [
                        'request_id' => $request->id,
                        'user_id' => $user->id,
                    ]);
                    $skippedCount++;
                    continue;
                }
                // Mark as sent for 24 hours
                Cache::put($cacheKey, true, now()->addDay());
                dispatch(new SendTransactionalEmail(
                    'request.notification.instant',
                    $user,
                    [
                        'Request_Title' => $request->capacity_development_title ?? 'N/A',
                        'Request_Link' => route('request.show', $request->id),
                        'user_name' => $user->name,
                        'Request_Subthemes' => implode(', ', $requestSubthemes),
                        'UNSUB' => route('unsubscribe.show', $user->id),
                        'UPDATE_PROFILE' => route('notification.preferences.index'),
                    ]
                ));

                $sentCount++;
            }

            Log::info('Request validated notifications dispatched', [
                'request_id' => $request->id,
                'sent' => $sentCount,
                'skipped' => $skippedCount,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send request validated notifications', [
                'request_id' => $request->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
