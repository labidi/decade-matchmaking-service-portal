<?php

namespace App\Services\NotificationPreference;

use App\Models\User;
use App\Models\UserNotificationPreference;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationPreferenceRepository
{
    public function __construct(
        private readonly NotificationPreferenceQueryBuilder $queryBuilder
    ) {
    }

    /**
     * Create a new preference
     */
    public function create(array $data): UserNotificationPreference
    {
        return UserNotificationPreference::create($data);
    }

    /**
     * Find preference by ID
     */
    public function findById(int $id): ?UserNotificationPreference
    {
        return UserNotificationPreference::find($id);
    }

    /**
     * Update preference
     */
    public function update(UserNotificationPreference $preference, array $data): bool
    {
        return $preference->update($data);
    }

    /**
     * Delete preference
     */
    public function delete(UserNotificationPreference $preference): bool
    {
        return $preference->delete();
    }

    /**
     * Update or create preference
     */
    public function updateOrCreate(array $attributes, array $values): UserNotificationPreference
    {
        return UserNotificationPreference::updateOrCreate($attributes, $values);
    }

    /**
     * Delete preference by user and attributes
     */
    public function deleteByUserAndAttributes(
        User $user,
        string $entityType,
        string $attributeType,
        string $attributeValue
    ): bool {
        return UserNotificationPreference::where('user_id', $user->id)
            ->where('entity_type', $entityType)
            ->where('attribute_type', $attributeType)
            ->where('attribute_value', $attributeValue)
            ->delete() > 0;
    }

    /**
     * Get paginated preferences
     */
    public function getPaginated(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildBaseQuery();
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Get paginated preferences for a specific user
     */
    public function getUserPreferencesPaginated(
        User $user,
        ?string $entityType = null,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildUserPreferencesQuery($user->id);
        
        if ($entityType !== null) {
            $query->where('entity_type', $entityType);
        }
        
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Get paginated active preferences
     */
    public function getActivePreferencesPaginated(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildActivePreferencesQuery();
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }
}