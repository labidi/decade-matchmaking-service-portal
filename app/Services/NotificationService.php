<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Opportunity;
use App\Models\Request as OCDRequest;
use App\Models\User;
use App\Models\NotificationPreference;
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
     * Send notifications for a new opportunity based on user preferences
     */
    public function notifyUsersForNewOpportunity(Opportunity $opportunity): array
    {
        $notificationsSent = [];

        DB::transaction(function () use ($opportunity, &$notificationsSent) {
            $matchingPreferences = $this->findMatchingPreferencesForOpportunity($opportunity);

            foreach ($matchingPreferences as $preference) {
                // Skip notification for the opportunity creator
                if ($preference->user_id === $opportunity->user_id) {
                    continue;
                }

                $notification = $this->createNotificationForOpportunity($opportunity, $preference);

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
     * Find user preferences that match the opportunity attributes
     */
    private function findMatchingPreferencesForOpportunity(Opportunity $opportunity): Collection
    {
        // For opportunities, we only care about the 'type' attribute
        if (empty($opportunity->type)) {
            return collect();
        }

        return NotificationPreference::forEntity(NotificationPreference::ENTITY_TYPE_OPPORTUNITY)
            ->forAttribute('type', $opportunity->type->value)
            ->withEmailNotificationsEnabled()
            ->with('user')
            ->get()
            ->unique('user_id');
    }

    /**
     * Extract opportunity attributes that can be used for notifications
     */
    private function extractOpportunityAttributes(Opportunity $opportunity): array
    {
        $attributes = [];

        // Opportunity Type
        if (!empty($opportunity->type)) {
            $attributes['type'] = is_array($opportunity->type) ? $opportunity->type['value'] : $opportunity->type;
        }

        // Coverage Activity
        if (!empty($opportunity->coverage_activity)) {
            $attributes['coverage_activity'] = is_array($opportunity->coverage_activity) ? $opportunity->coverage_activity['value'] : $opportunity->coverage_activity;
        }

        // Implementation Location
        if (!empty($opportunity->implementation_location)) {
            if (is_array($opportunity->implementation_location)) {
                $attributes['implementation_location'] = array_column($opportunity->implementation_location, 'value');
            } else {
                $attributes['implementation_location'] = [$opportunity->implementation_location];
            }
        }

        // Target Audience
        if (!empty($opportunity->target_audience)) {
            if (is_array($opportunity->target_audience)) {
                $attributes['target_audience'] = array_column($opportunity->target_audience, 'value');
            } else {
                $attributes['target_audience'] = [$opportunity->target_audience];
            }
        }

        // Key Words
        if (!empty($opportunity->key_words) && is_array($opportunity->key_words)) {
            $attributes['key_words'] = $opportunity->key_words;
        }

        return array_filter($attributes);
    }

    /**
     * Create notification for a user based on matching opportunity preference
     */
    private function createNotificationForOpportunity(Opportunity $opportunity, NotificationPreference $preference): ?Notification
    {
        $title = $this->generateOpportunityNotificationTitle($preference);
        $description = $this->generateOpportunityNotificationDescription($opportunity, $preference);

        return Notification::create([
            'user_id' => $preference->user_id,
            'title' => $title,
            'description' => $description,
            'is_read' => false,
        ]);
    }

    /**
     * Generate notification title for opportunity based on preference
     */
    private function generateOpportunityNotificationTitle(NotificationPreference $preference): string
    {
        $attributeDisplayName = $preference->getAttributeTypeDisplayName();
        return "New Opportunity Matching Your {$attributeDisplayName} Interest";
    }

    /**
     * Generate notification description for opportunity
     */
    private function generateOpportunityNotificationDescription(Opportunity $opportunity, NotificationPreference $preference): string
    {
        $opportunityTitle = $opportunity->title ?? 'New Opportunity';
        $attributeDisplayName = $preference->getAttributeTypeDisplayName();

        return "A new opportunity '{$opportunityTitle}' has been published that matches your {$attributeDisplayName} interest in '{$preference->attribute_value}'.";
    }

    /**
     * Find user preferences that match the request attributes
     */
    private function findMatchingPreferences(OCDRequest $request): Collection
    {
        $matchingPreferences = collect();

        // Get subthemes from request (only attribute we care about for requests)
        $subthemes = $this->getRequestSubthemes($request);

        foreach ($subthemes as $subtheme) {
            if (empty($subtheme)) {
                continue;
            }

            $preferences = NotificationPreference::forEntity(NotificationPreference::ENTITY_TYPE_REQUEST)
                ->forAttribute('subtheme', $subtheme)
                ->withEmailNotificationsEnabled()
                ->with('user')
                ->get();

            $matchingPreferences = $matchingPreferences->merge($preferences);
        }

        // Remove duplicates based on user_id
        return $matchingPreferences->unique('user_id');
    }

    /**
     * Get subthemes from request
     */
    private function getRequestSubthemes(OCDRequest $request): array
    {
        // Get request data - handle both JSON and normalized storage
        $requestData = $request->request_data ?? [];

        // From JSON data
        if (isset($requestData['subthemes']) && is_array($requestData['subthemes'])) {
            return $requestData['subthemes'];
        }

        // From normalized table
        if ($request->requestDetail && !empty($request->requestDetail->subthemes)) {
            return json_decode($request->requestDetail->subthemes, true) ?? [];
        }

        return [];
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
    private function createNotificationForRequest(OCDRequest $request, NotificationPreference $preference): ?Notification
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
    private function generateNotificationTitle(NotificationPreference $preference): string
    {
        $attributeDisplayName = $preference->getAttributeTypeDisplayName();
        return "New Request Matching Your {$attributeDisplayName} Interest";
    }

    /**
     * Generate notification description
     */
    private function generateNotificationDescription(OCDRequest $request, NotificationPreference $preference): string
    {
        $requestTitle = $request->detail?->title ?? 'New Request';
        $attributeDisplayName = $preference->getAttributeTypeDisplayName();

        return "A new request '{$requestTitle}' has been submitted that matches your {$attributeDisplayName} interest in '{$preference->attribute_value}'.";
    }

    /**
     * Get user's notification preferences grouped by attribute type
     */
    public function getUserPreferences(User $user, ?string $entityType = null): array
    {
        $query = NotificationPreference::where('user_id', $user->id);

        if ($entityType !== null) {
            $query->forEntity($entityType);
        }

        $preferences = $query->orderBy('entity_type')
            ->orderBy('attribute_type')
            ->orderBy('attribute_value')
            ->get();

        if ($entityType !== null) {
            return $preferences->groupBy('attribute_type')->toArray();
        }

        // If no entity filter, group by entity_type first, then attribute_type
        return $preferences->groupBy('entity_type')->map(function ($entityPreferences) {
            return $entityPreferences->groupBy('attribute_type');
        })->toArray();
    }

    /**
     * Update or create user preference
     */
    public function updateUserPreference(
        User $user,
        string $attributeType,
        string $attributeValue,
        bool $emailNotificationEnabled = false,
        string $entityType = NotificationPreference::ENTITY_TYPE_REQUEST
    ): NotificationPreference {
        return NotificationPreference::updateOrCreate(
            [
                'user_id' => $user->id,
                'entity_type' => $entityType,
                'attribute_type' => $attributeType,
                'attribute_value' => $attributeValue,
            ],
            [
                'email_notification_enabled' => $emailNotificationEnabled,
            ]
        );
    }

    /**
     * Remove user preference
     */
    public function removeUserPreference(
        User $user,
        string $attributeType,
        string $attributeValue,
        string $entityType = NotificationPreference::ENTITY_TYPE_REQUEST
    ): bool {
        return NotificationPreference::where('user_id', $user->id)
            ->where('entity_type', $entityType)
            ->where('attribute_type', $attributeType)
            ->where('attribute_value', $attributeValue)
            ->delete() > 0;
    }

    /**
     * Notify administrators about offer acceptance
     */
    public function notifyAdminOfOfferAcceptance(OCDRequest $request, User $user): void
    {
        try {
            // Get all administrator users
            $adminUsers = User::role('administrator')->get();

            foreach ($adminUsers as $admin) {
                $this->createNotificationForAdmin($admin, [
                    'title' => 'Offer Accepted',
                    'description' => $this->generateOfferAcceptanceDescription($request, $user),
                    'type' => 'offer_accepted',
                    'request_id' => $request->id
                ]);
            }

            Log::info('Admin notifications sent for offer acceptance', [
                'request_id' => $request->id,
                'user_id' => $user->id,
                'admin_count' => $adminUsers->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send admin notifications for offer acceptance', [
                'request_id' => $request->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Notify administrators about clarification request
     */
    public function notifyAdminOfClarificationRequest(OCDRequest $request, User $user, ?string $message = null): void
    {
        try {
            // Get all administrator users
            $adminUsers = User::role('administrator')->get();

            foreach ($adminUsers as $admin) {
                $this->createNotificationForAdmin($admin, [
                    'title' => 'Clarification Requested',
                    'description' => $this->generateClarificationRequestDescription($request, $user, $message),
                    'type' => 'clarification_requested',
                    'request_id' => $request->id
                ]);
            }

            Log::info('Admin notifications sent for clarification request', [
                'request_id' => $request->id,
                'user_id' => $user->id,
                'admin_count' => $adminUsers->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send admin notifications for clarification request', [
                'request_id' => $request->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Create notification for admin user
     */
    private function createNotificationForAdmin(User $admin, array $data): ?Notification
    {
        return Notification::create([
            'user_id' => $admin->id,
            'title' => $data['title'],
            'description' => $data['description'],
            'is_read' => false,
        ]);
    }

    /**
     * Generate description for offer acceptance notification
     */
    private function generateOfferAcceptanceDescription(OCDRequest $request, User $user): string
    {
        $requestTitle = $request->detail?->capacity_development_title ?? 'Request #' . $request->id;
        $userName = $user->name ?? 'User';

        return "User '{$userName}' has accepted the offer for request '{$requestTitle}'. The offer is now confirmed and ready for implementation.";
    }

    /**
     * Generate description for clarification request notification
     */
    private function generateClarificationRequestDescription(OCDRequest $request, User $user, ?string $message = null): string
    {
        $requestTitle = $request->detail?->capacity_development_title ?? 'Request #' . $request->id;
        $userName = $user->name ?? 'User';

        $description = "User '{$userName}' has requested clarification for the offer on request '{$requestTitle}'.";

        if ($message) {
            $description .= " Message: '{$message}'";
        }

        return $description;
    }
}
