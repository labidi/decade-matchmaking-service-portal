<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\NotificationPreference;
use App\Models\User;

class NotificationPreferencePolicy
{
    /**
     * Determine whether the user can view any notification preferences.
     */
    public function viewAny(?User $user): bool
    {
        return $user !== null;
    }

    /**
     * Determine whether the user can view the notification preference.
     */
    public function view(?User $user, NotificationPreference $preference): bool
    {
        if (! $user) {
            return false;
        }

        // Users can view their own preferences
        // Admins can view any preferences
        return $user->id === $preference->user_id
            || $user->hasRole('administrator');
    }

    /**
     * Determine whether the user can create notification preferences.
     */
    public function create(?User $user): bool
    {
        // All authenticated users can create preferences
        return $user !== null;
    }

    /**
     * Determine whether the user can update the notification preference.
     */
    public function update(?User $user, NotificationPreference $preference): bool
    {
        if (! $user) {
            return false;
        }

        // Users can update their own preferences
        // Admins can update any preferences
        return $user->id === $preference->user_id
            || $user->hasRole('administrator');
    }

    /**
     * Determine whether the user can delete the notification preference.
     */
    public function delete(?User $user, NotificationPreference $preference): bool
    {
        if (! $user) {
            return false;
        }

        // Users can delete their own preferences
        // Admins can delete any preferences
        return $user->id === $preference->user_id
            || $user->hasRole('administrator');
    }
}
