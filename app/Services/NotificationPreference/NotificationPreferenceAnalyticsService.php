<?php

namespace App\Services\NotificationPreference;

use App\Models\User;
use App\Models\UserNotificationPreference;

class NotificationPreferenceAnalyticsService
{
    /**
     * Get user preference statistics
     */
    public function getUserPreferenceStats(User $user): array
    {
        $totalPreferences = UserNotificationPreference::where('user_id', $user->id)->count();
        $activeEmails = UserNotificationPreference::where('user_id', $user->id)
            ->where('email_notification_enabled', true)
            ->count();

        // Entity type breakdown
        $entityStats = UserNotificationPreference::where('user_id', $user->id)
            ->selectRaw('entity_type, COUNT(*) as count')
            ->groupBy('entity_type')
            ->pluck('count', 'entity_type')
            ->toArray();

        // Attribute type breakdown
        $attributeStats = UserNotificationPreference::where('user_id', $user->id)
            ->selectRaw('attribute_type, COUNT(*) as count, entity_type')
            ->groupBy('entity_type', 'attribute_type')
            ->get()
            ->groupBy('entity_type')
            ->map(function ($attributes) {
                return $attributes->pluck('count', 'attribute_type');
            })
            ->toArray();

        return [
            'total_preferences' => $totalPreferences,
            'active_emails' => $activeEmails,
            'email_rate' => $totalPreferences > 0 ? round(($activeEmails / $totalPreferences) * 100, 1) : 0,
            'entity_breakdown' => $entityStats,
            'attribute_breakdown' => $attributeStats,
        ];
    }

    /**
     * Get global preference statistics (admin only)
     */
    public function getGlobalPreferenceStats(): array
    {
        $totalUsers = UserNotificationPreference::distinct('user_id')->count();
        $totalPreferences = UserNotificationPreference::count();
        $activeEmailPreferences = UserNotificationPreference::where('email_notification_enabled', true)->count();

        // Most popular attributes by entity
        $popularAttributes = UserNotificationPreference::selectRaw('entity_type, attribute_type, attribute_value, COUNT(*) as count')
            ->groupBy('entity_type', 'attribute_type', 'attribute_value')
            ->orderByDesc('count')
            ->limit(20)
            ->get()
            ->groupBy('entity_type');

        // Entity distribution
        $entityDistribution = UserNotificationPreference::selectRaw('entity_type, COUNT(*) as count')
            ->groupBy('entity_type')
            ->pluck('count', 'entity_type')
            ->toArray();

        return [
            'total_users_with_preferences' => $totalUsers,
            'total_preferences' => $totalPreferences,
            'active_email_preferences' => $activeEmailPreferences,
            'email_activation_rate' => $totalPreferences > 0 ? round(($activeEmailPreferences / $totalPreferences) * 100, 1) : 0,
            'avg_preferences_per_user' => $totalUsers > 0 ? round($totalPreferences / $totalUsers, 1) : 0,
            'entity_distribution' => $entityDistribution,
            'popular_attributes' => $popularAttributes->toArray(),
        ];
    }

    /**
     * Get notification effectiveness stats
     */
    public function getNotificationEffectivenessStats(): array
    {
        // This would require tracking notification opens/clicks
        // For now, return basic structure
        return [
            'total_notifications_sent' => 0, // Would need tracking table
            'notification_open_rate' => 0,
            'email_open_rate' => 0,
            'click_through_rate' => 0,
        ];
    }
}