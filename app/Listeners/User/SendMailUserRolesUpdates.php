<?php

namespace App\Listeners\User;

use App\Events\User\UserRoleChanged;
use App\Notifications\User\UserRolesChangedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Listener for UserRoleChanged event.
 *
 * Handles:
 * - Sending email notifications about role changes
 */
class SendMailUserRolesUpdates implements ShouldQueue
{
    public function handle(UserRoleChanged $event): void
    {
        $event->user->notify(new UserRolesChangedNotification());
    }
}
