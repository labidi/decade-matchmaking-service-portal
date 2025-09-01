<?php

namespace App\Services\NotificationPreference;

use App\Models\User;
use App\Models\UserNotificationPreference;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class NotificationPreferenceService
{
    public function __construct(
        private readonly NotificationPreferenceRepository $repository,
        private readonly NotificationPreferenceAnalyticsService $analytics
    ) {
    }

    /**
     * Get paginated preferences for a user
     */
    public function getUserPreferencesPaginated(
        User $user,
        ?string $entityType = null,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        return $this->repository->getUserPreferencesPaginated($user, $entityType, $searchFilters, $sortFilters);
    }

    /**
     * Get paginated preferences for all users (admin only)
     */
    public function getAllPreferencesPaginated(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        return $this->repository->getPaginated($searchFilters, $sortFilters);
    }

    /**
     * Get paginated active preferences
     */
    public function getActivePreferencesPaginated(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        return $this->repository->getActivePreferencesPaginated($searchFilters, $sortFilters);
    }

    /**
     * Create or update user preference
     */
    public function updateUserPreference(
        User $user,
        string $entityType,
        string $attributeType,
        string $attributeValue,
        bool $emailEnabled
    ): UserNotificationPreference {
        return $this->repository->updateOrCreate([
            'user_id' => $user->id,
            'entity_type' => $entityType,
            'attribute_type' => $attributeType,
            'attribute_value' => $attributeValue,
        ], [
            'email_notification_enabled' => $emailEnabled,
        ]);
    }

    /**
     * Remove user preference
     */
    public function removeUserPreference(
        User $user,
        string $entityType,
        string $attributeType,
        string $attributeValue
    ): bool {
        return $this->repository->deleteByUserAndAttributes($user, $entityType, $attributeType, $attributeValue);
    }

    /**
     * Bulk update preferences
     */
    public function bulkUpdatePreferences(User $user, array $preferences): Collection
    {
        $updated = collect();

        foreach ($preferences as $preference) {
            $updated->push($this->updateUserPreference(
                $user,
                $preference['entity_type'],
                $preference['attribute_type'],
                $preference['attribute_value'],
                $preference['email_notification_enabled'] ?? false
            ));
        }

        return $updated;
    }

    /**
     * Get preference statistics for a user
     */
    public function getPreferenceStats(User $user): array
    {
        return $this->analytics->getUserPreferenceStats($user);
    }

    /**
     * Get available options for an entity type
     */
    public function getAvailableOptionsForEntity(string $entityType): array
    {
        return UserNotificationPreference::getAttributeTypesForEntity($entityType);
    }
}
