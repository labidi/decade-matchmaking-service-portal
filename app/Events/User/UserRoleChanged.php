<?php

declare(strict_types=1);

namespace App\Events\User;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event dispatched when a user's roles are changed.
 *
 * This event is fired when user roles are assigned or removed.
 * Listeners can log role changes for security auditing.
 */
class UserRoleChanged
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param User $user The user with changed roles
     * @param array<string> $previousRoles Array of previous role names
     * @param array<string> $newRoles Array of new role names
     */
    public function __construct(
        public readonly User $user,
        public readonly array $previousRoles,
        public readonly array $newRoles
    ) {
    }
}
