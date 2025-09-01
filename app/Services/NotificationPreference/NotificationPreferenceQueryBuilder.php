<?php

namespace App\Services\NotificationPreference;

use App\Models\NotificationPreference;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class NotificationPreferenceQueryBuilder
{
    /**
     * Build base query with relationships
     */
    public function buildBaseQuery(): Builder
    {
        return NotificationPreference::with(['user']);
    }

    /**
     * Build query for user preferences
     */
    public function buildUserPreferencesQuery(int $userId): Builder
    {
        return $this->buildBaseQuery()->where('user_id', $userId);
    }

    /**
     * Build query for active email preferences
     */
    public function buildActivePreferencesQuery(): Builder
    {
        return $this->buildBaseQuery()->where('email_notification_enabled', true);
    }

    /**
     * Apply search filters to query
     */
    public function applySearchFilters(Builder $query, array $searchFilters): Builder
    {
        // Filter by entity type
        if (!empty($searchFilters['entity_type'])) {
            $query->where('entity_type', $searchFilters['entity_type']);
        }

        // Filter by attribute type
        if (!empty($searchFilters['attribute_type'])) {
            $query->where('attribute_type', $searchFilters['attribute_type']);
        }

        // Filter by attribute value (partial match)
        if (!empty($searchFilters['attribute_value'])) {
            $query->where('attribute_value', 'like', '%' . $searchFilters['attribute_value'] . '%');
        }

        // Filter by email notification enabled status
        if (isset($searchFilters['email_notification_enabled'])) {
            $query->where('email_notification_enabled', (bool) $searchFilters['email_notification_enabled']);
        }

        // General search (searches across attribute values)
        if (!empty($searchFilters['search'])) {
            $searchTerm = $searchFilters['search'];
            $query->where(function (Builder $q) use ($searchTerm) {
                $q->where('attribute_value', 'like', "%{$searchTerm}%")
                  ->orWhere('attribute_type', 'like', "%{$searchTerm}%");
            });
        }

        // Filter by user (admin only)
        if (!empty($searchFilters['user'])) {
            $query->whereHas('user', function (Builder $q) use ($searchFilters) {
                $q->where('name', 'like', '%' . $searchFilters['user'] . '%')
                  ->orWhere('email', 'like', '%' . $searchFilters['user'] . '%');
            });
        }

        // Date range filters
        if (!empty($searchFilters['date_from'])) {
            $query->where('created_at', '>=', $searchFilters['date_from']);
        }

        if (!empty($searchFilters['date_to'])) {
            $query->where('created_at', '<=', $searchFilters['date_to']);
        }

        return $query;
    }

    /**
     * Apply sorting to query
     */
    public function applySorting(Builder $query, array $sortFilters): Builder
    {
        $field = $sortFilters['field'] ?? 'created_at';
        $order = $sortFilters['order'] ?? 'desc';

        // Validate sort field
        $allowedFields = [
            'entity_type',
            'attribute_type',
            'attribute_value',
            'email_notification_enabled',
            'created_at',
            'updated_at'
        ];

        if (in_array($field, $allowedFields)) {
            $query->orderBy($field, $order);
        } else {
            // Default sorting
            $query->orderBy('created_at', 'desc');
        }

        // Secondary sort by entity_type and attribute_type for consistency
        if ($field !== 'entity_type') {
            $query->orderBy('entity_type');
        }
        if ($field !== 'attribute_type') {
            $query->orderBy('attribute_type');
        }

        return $query;
    }

    /**
     * Apply pagination to query
     */
    public function applyPagination(Builder $query, array $sortFilters): LengthAwarePaginator
    {
        $perPage = $sortFilters['per_page'] ?? 15;
        $perPage = min($perPage, 100); // Max 100 per page

        return $query->paginate($perPage);
    }
}
