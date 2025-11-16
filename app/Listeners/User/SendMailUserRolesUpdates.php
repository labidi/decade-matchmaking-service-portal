<?php

namespace App\Listeners\User;

use App\Events\User\UserRoleChanged;
use App\Jobs\Email\SendTransactionalEmail;
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
        $user = $event->user;
        dispatch(new SendTransactionalEmail(
            'user.roles_changed',
            $user,
            [
                'name' => $user->name,
                'portal_url' => route('user.home'),
            ]
        ));
    }
}
