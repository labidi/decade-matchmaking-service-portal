<?php

declare(strict_types=1);

namespace App\Listeners\User;

use App\Events\User\UserRegistered;
use App\Jobs\Email\SendTransactionalEmail;
use App\Models\SystemNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener for UserRegistered event.
 *
 * Handles:
 * - Sending welcome email to new users
 * - Creating welcome notification
 */
class SendWelcomeEmail implements ShouldQueue
{
    /**
     * Handle the event.
     *
     * @param UserRegistered $event The user registered event
     * @return void
     */
    public function handle(UserRegistered $event): void
    {
        $user = $event->user;

        try {
            // Send welcome email
            dispatch(new SendTransactionalEmail(
                'user.registered',
                $user,
                [
                    'user_name' => $user->name,
                    'Dashboard_Link' => route('user.home'),
                    'Profile_Link' => route('profile.edit'),
                    'UNSUB' => route('unsubscribe.show', $user->id),
                    'UPDATE_PROFILE' => route('notification.preferences.index'),
                ]
            ));

            // Create welcome notification
            SystemNotification::create([
                'user_id' => $user->id,
                'title' => 'Welcome to Ocean Decade Portal',
                'description' => sprintf(
                    'Welcome %s! Thank you for joining the Ocean Decade Portal. Explore opportunities and submit requests to advance ocean science.',
                    $user->name
                ),
                'is_read' => false,
            ]);

            Log::info('Welcome email and notification sent', [
                'user_id' => $user->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send welcome email', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
