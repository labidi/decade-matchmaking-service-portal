<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class PaginationService
{
    /**
     * Apply pagination to query
     */
    public function paginate(Builder $query, array $params): LengthAwarePaginator
    {
        $perPage = $params['per_page'] ?? 10;
        return $query->paginate($perPage);
    }

    /**
     * Apply sorting to query
     */
    public function applySorting(Builder $query, array $sortFilters): Builder
    {
        $field = $sortFilters['field'] ?? $sortFilters['sort'] ?? 'created_at';
        $order = $sortFilters['order'] ?? 'desc';
        return $query->orderBy($field, $order);
    }


}
