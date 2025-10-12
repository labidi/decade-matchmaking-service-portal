<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\NotificationPreference;
use App\Models\RequestSubscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UnsubscribeService
{
    /**
     * Unsubscribe a user from all email notifications
     *
     * @throws \Exception
     */
    public function unsubscribeFromAllNotifications(User $user, bool $removeSubscriptions = false): bool
    {
        DB::beginTransaction();

        try {
            // Disable all notification preferences for the user
            $updatedCount = NotificationPreference::where('user_id', $user->id)
                ->update(['email_notification_enabled' => false]);

            // Optionally remove all request subscriptions
            if ($removeSubscriptions) {
                RequestSubscription::where('user_id', $user->id)->delete();
            }

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to unsubscribe user from notifications', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
