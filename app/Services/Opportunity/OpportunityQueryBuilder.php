<?php

namespace App\Services\Opportunity;

use App\Enums\OpportunityStatus;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OpportunityQueryBuilder
{
    /**
     * Build base query for opportunities
     */
    public function buildBaseQuery(): Builder
    {
        return Opportunity::query();
    }

    /**
     * Apply search and filter conditions to query
     */
    public function applyFilters(Builder $query, array $filters, User $user): Builder
    {
        // Filter by type
        if (isset($filters['type']) && !empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Filter by status
        if (isset($filters['status']) && !empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by location
        if (isset($filters['location']) && !empty($filters['location'])) {
            $query->where('implementation_location', 'like', '%' . $filters['location'] . '%');
        }

        // Filter by title or description
        if (isset($filters['search']) && !empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%');
            });
        }

        // Filter by date range
        if (isset($filters['date_from']) && !empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to']) && !empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Public opportunities filter (exclude user's own opportunities)
        if (isset($filters['public']) && $filters['public']) {
            $query->where('user_id', '!=', $user->id)
                  ->where('status', OpportunityStatus::ACTIVE);
        }

        return $query;
    }

    /**
     * Apply search filters to query (compatible with RequestsController pattern)
     */
    public function applySearchFilters(Builder $query, array $searchFilters): Builder
    {
        // Filter by user (search by user name or email)
        if (isset($searchFilters['user']) && !empty($searchFilters['user'])) {
            $userSearchTerm = $searchFilters['user'];
            $query->whereHas('user', function ($q) use ($userSearchTerm) {
                $q->where('name', 'like', '%' . $userSearchTerm . '%')
                  ->orWhere('email', 'like', '%' . $userSearchTerm . '%');
            });
        }

        // Filter by title
        if (isset($searchFilters['title']) && !empty($searchFilters['title'])) {
            $query->where('title', 'like', '%' . $searchFilters['title'] . '%');
        }

        // Filter by type
        if (isset($searchFilters['type']) && !empty($searchFilters['type'])) {
            $query->where('type', $searchFilters['type']);
        }

        // Filter by status
        if (isset($searchFilters['status']) && !empty($searchFilters['status'])) {
            $query->where('status', $searchFilters['status']);
        }

        // Filter by location
        if (isset($searchFilters['location']) && !empty($searchFilters['location'])) {
            $query->where('implementation_location', 'like', '%' . $searchFilters['location'] . '%');
        }

        // Filter by closing date
        if (isset($searchFilters['closing_date']) && !empty($searchFilters['closing_date'])) {
            $query->whereDate('closing_date', '>=', $searchFilters['closing_date']);
        }

        return $query;
    }

    /**
     * Apply sorting to query (compatible with RequestsController pattern)
     */
    public function applySorting(Builder $query, array $sortFilters): Builder
    {
        $sortField = $sortFilters['field'] ?? 'created_at';
        $sortOrder = $sortFilters['order'] ?? 'desc';

        // Validate sort fields
        $allowedSortFields = [
            'created_at',
            'title',
            'type',
            'status',
            'closing_date',
            'implementation_location'
        ];

        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortOrder);
        } else {
            // Default sorting
            $query->orderBy('created_at', 'desc');
        }

        return $query;
    }

    /**
     * Apply pagination to query
     */
    public function applyPagination(Builder $query, array $sortFilters): LengthAwarePaginator
    {
        $perPage = $sortFilters['per_page'] ?? 10;
        return $query->paginate($perPage);
    }

    /**
     * Get opportunities with relationships loaded
     */
    public function withRelations(Builder $query, array $relations = []): Builder
    {
        $defaultRelations = ['user'];
        $relations = array_merge($defaultRelations, $relations);

        return $query->with($relations);
    }

    /**
     * Filter opportunities by user ownership
     */
    public function filterByOwnership(Builder $query, User $user, bool $ownOnly = true): Builder
    {
        if ($ownOnly) {
            $query->where('user_id', $user->id);
        } else {
            $query->where('user_id', '!=', $user->id);
        }

        return $query;
    }

    /**
     * Filter by active status only
     */
    public function filterByActiveStatus(Builder $query): Builder
    {
        return $query->where('status', OpportunityStatus::ACTIVE);
    }
}
