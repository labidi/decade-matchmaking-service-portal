<?php

declare(strict_types=1);

namespace App\Observers;

use App\Events\User\UserProfileUpdated;
use App\Events\User\UserRegistered;
use App\Events\User\UserRoleChanged;
use App\Models\User;

/**
 * Observer for User model.
 *
 * This observer follows the Single Responsibility Principle:
 * - Only checks conditions and dispatches events
 * - All business logic moved to event listeners
 */
class UserObserver
{
    /**
     * Handle the User "created" event.
     *
     * @param User $user The newly created user
     * @return void
     */
    public function created(User $user): void
    {
        UserRegistered::dispatch($user);
    }

    /**
     * Handle the User "updated" event.
     *
     * @param User $user The updated user
     * @return void
     */
    public function updated(User $user): void
    {
        // Get changed fields for profile updates
        $changedFields = array_keys($user->getDirty());

        // Filter out sensitive fields and timestamps
        $profileFields = array_diff($changedFields, [
            'password',
            'remember_token',
            'email_verified_at',
            'updated_at',
            'created_at',
        ]);

        // Dispatch profile update event if profile fields changed
        if (! empty($profileFields)) {
            UserProfileUpdated::dispatch($user, $profileFields);
        }

        // Check if roles changed (requires spatie/laravel-permission package)
        // This would typically be handled by the package itself
        // For now, we'll leave this as a placeholder for future implementation
    }

    /**
     * Handle the User "deleted" event.
     *
     * @param User $user The user being deleted
     * @return void
     */
    public function deleted(User $user): void
    {
        // No event needed for user deletion currently
        // Could add UserDeleted event in the future if needed
    }

    /**
     * Handle the User "restored" event.
     *
     * @param User $user The restored user
     * @return void
     */
    public function restored(User $user): void
    {
        // No event needed for restoration currently
    }

    /**
     * Handle the User "force deleted" event.
     *
     * @param User $user The force deleted user
     * @return void
     */
    public function forceDeleted(User $user): void
    {
        // No event needed for force deletion currently
    }
}
