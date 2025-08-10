<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Request as OCDRequest;
use App\Models\User;
use App\Models\UserNotificationPreference;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send notifications for a new request based on user preferences
     */
    public function notifyUsersForNewRequest(OCDRequest $request): array
    {
        // needs refactoring to handle only normalized storage
        $notificationsSent = [];

        DB::transaction(function () use ($request, &$notificationsSent) {
            $matchingPreferences = $this->findMatchingPreferences($request);

            foreach ($matchingPreferences as $preference) {
                // Skip notification for the request creator
                if ($preference->user_id === $request->user_id) {
                    continue;
                }

                $notification = $this->createNotificationForRequest($request, $preference);

                if ($notification) {
                    $notificationsSent[] = [
                        'user_id' => $preference->user_id,
                        'notification_id' => $notification->id,
                        'attribute_type' => $preference->attribute_type,
                        'attribute_value' => $preference->attribute_value,
                    ];
                }
            }
        });

        return $notificationsSent;
    }

    /**
     * Find user preferences that match the request attributes
     */
    private function findMatchingPreferences(OCDRequest $request): Collection
    {
        $matchingPreferences = collect();

        // Get request data - handle both JSON and normalized storage
        $requestData = $request->request_data ?? [];

        // Extract attributes to check against preferences
        $attributesToCheck = $this->extractRequestAttributes($request, $requestData);

        foreach ($attributesToCheck as $attributeType => $values) {
            if (empty($values)) {
                continue;
            }

            // Handle both single values and arrays
            $valuesArray = is_array($values) ? $values : [$values];

            foreach ($valuesArray as $value) {
                if (empty($value)) {
                    continue;
                }

                $preferences = UserNotificationPreference::withNotificationsEnabled()
                    ->forAttribute($attributeType, $value)
                    ->with('user')
                    ->get();

                $matchingPreferences = $matchingPreferences->merge($preferences);
            }
        }

        // Remove duplicates based on user_id
        return $matchingPreferences->unique('user_id');
    }

    /**
     * Extract request attributes that can be used for notifications
     */
    private function extractRequestAttributes(OCDRequest $request, array $requestData): array
    {
        $attributes = [];

        // Subthemes (from JSON array or normalized table)
        if (isset($requestData['subthemes']) && is_array($requestData['subthemes'])) {
            $attributes['subtheme'] = $requestData['subthemes'];
        } elseif ($request->requestDetail && !empty($request->requestDetail->subthemes)) {
            $attributes['subtheme'] = json_decode($request->requestDetail->subthemes, true) ?? [];
        }

        // Coverage Activity
        if (isset($requestData['coverage_activity'])) {
            $attributes['coverage_activity'] = $requestData['coverage_activity'];
        } elseif ($request->requestDetail && !empty($request->requestDetail->coverage_activity)) {
            $attributes['coverage_activity'] = $request->requestDetail->coverage_activity;
        }

        // Implementation Location
        if (isset($requestData['implementation_location'])) {
            $attributes['implementation_location'] = $requestData['implementation_location'];
        } elseif ($request->requestDetail && !empty($request->requestDetail->implementation_location)) {
            $attributes['implementation_location'] = $request->requestDetail->implementation_location;
        }

        // Target Audience (from JSON array)
        if (isset($requestData['target_audience']) && is_array($requestData['target_audience'])) {
            $attributes['target_audience'] = $requestData['target_audience'];
        } elseif ($request->requestDetail && !empty($request->requestDetail->target_audience)) {
            $attributes['target_audience'] = json_decode($request->requestDetail->target_audience, true) ?? [];
        }

        // Support Type (from JSON array)
        if (isset($requestData['support_types']) && is_array($requestData['support_types'])) {
            $attributes['support_type'] = $requestData['support_types'];
        } elseif ($request->requestDetail && !empty($request->requestDetail->support_types)) {
            $attributes['support_type'] = json_decode($request->requestDetail->support_types, true) ?? [];
        }

        // Priority Level
        if (isset($requestData['priority_level'])) {
            $attributes['priority_level'] = $requestData['priority_level'];
        } elseif ($request->requestDetail && !empty($request->requestDetail->priority_level)) {
            $attributes['priority_level'] = $request->requestDetail->priority_level;
        }

        // Funding Amount Range (calculated from min/max)
        $fundingRange = $this->calculateFundingRange($requestData, $request);
        if ($fundingRange) {
            $attributes['funding_amount_range'] = $fundingRange;
        }

        return array_filter($attributes);
    }

    /**
     * Calculate funding amount range category
     */
    private function calculateFundingRange(array $requestData, OCDRequest $request): ?string
    {
        $minAmount = $requestData['minimum_funding_amount'] ?? $request->requestDetail?->minimum_funding_amount ?? 0;
        $maxAmount = $requestData['maximum_funding_amount'] ?? $request->requestDetail?->maximum_funding_amount ?? 0;

        if ($maxAmount <= 0) {
            return null;
        }

        // Define funding ranges
        if ($maxAmount <= 10000) {
            return 'Under $10K';
        } elseif ($maxAmount <= 50000) {
            return '$10K - $50K';
        } elseif ($maxAmount <= 100000) {
            return '$50K - $100K';
        } elseif ($maxAmount <= 500000) {
            return '$100K - $500K';
        } else {
            return 'Over $500K';
        }
    }

    /**
     * Create notification for a user based on matching preference
     */
    private function createNotificationForRequest(OCDRequest $request, UserNotificationPreference $preference): ?Notification
    {
        $title = $this->generateNotificationTitle($preference);
        $description = $this->generateNotificationDescription($request, $preference);

        return Notification::create([
            'user_id' => $preference->user_id,
            'title' => $title,
            'description' => $description,
            'is_read' => false,
        ]);
    }

    /**
     * Generate notification title based on preference
     */
    private function generateNotificationTitle(UserNotificationPreference $preference): string
    {
        $attributeDisplayName = $preference->getAttributeTypeDisplayName();
        return "New Request Matching Your {$attributeDisplayName} Interest";
    }

    /**
     * Generate notification description
     */
    private function generateNotificationDescription(OCDRequest $request, UserNotificationPreference $preference): string
    {
        $requestTitle = $request->detail?->title ?? 'New Request';
        $attributeDisplayName = $preference->getAttributeTypeDisplayName();

        return "A new request '{$requestTitle}' has been submitted that matches your {$attributeDisplayName} interest in '{$preference->attribute_value}'.";
    }

    /**
     * Get user's notification preferences grouped by attribute type
     */
    public function getUserPreferences(User $user): array
    {
        $preferences = UserNotificationPreference::where('user_id', $user->id)
            ->orderBy('attribute_type')
            ->orderBy('attribute_value')
            ->get();

        return $preferences->groupBy('attribute_type')->toArray();
    }

    /**
     * Update or create user preference
     */
    public function updateUserPreference(
        User $user,
        string $attributeType,
        string $attributeValue,
        bool $notificationEnabled = true,
        bool $emailNotificationEnabled = false
    ): UserNotificationPreference {
        return UserNotificationPreference::updateOrCreate(
            [
                'user_id' => $user->id,
                'attribute_type' => $attributeType,
                'attribute_value' => $attributeValue,
            ],
            [
                'notification_enabled' => $notificationEnabled,
                'email_notification_enabled' => $emailNotificationEnabled,
            ]
        );
    }

    /**
     * Remove user preference
     */
    public function removeUserPreference(User $user, string $attributeType, string $attributeValue): bool
    {
        return UserNotificationPreference::where('user_id', $user->id)
            ->where('attribute_type', $attributeType)
            ->where('attribute_value', $attributeValue)
            ->delete() > 0;
    }
}
