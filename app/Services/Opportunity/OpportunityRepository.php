<?php

namespace App\Services\Opportunity;

use App\Enums\Opportunity\Status;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class OpportunityRepository
{
    public function __construct(
        private readonly OpportunityQueryBuilder $queryBuilder
    ) {
    }

    /**
     * Create a new opportunity
     */
    public function create(array $data): Opportunity
    {
        $opportunity = new Opportunity($data);
        $opportunity->save();
        return $opportunity;
    }

    /**
     * Find opportunity by ID
     */
    public function findById(int $id): ?Opportunity
    {
        return Opportunity::find($id);
    }

    /**
     * Get opportunities submitted by a specific user
     */
    public function getByUser(User $user): Collection
    {
        return Opportunity::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get public opportunities (active status only)
     */
    public function getPublicOpportunities(): Collection
    {
        return Opportunity::where('status', Status::ACTIVE)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Update opportunity
     */
    public function update(Opportunity $opportunity, array $data): bool
    {
        return $opportunity->update($data);
    }

    /**
     * Delete opportunity
     */
    public function delete(Opportunity $opportunity): bool
    {
        return $opportunity->delete();
    }

    /**
     * Get opportunities count by status for a user
     */
    public function getCountByStatus(User $user): array
    {
        $opportunities = $this->getByUser($user);

        return [
            'total' => $opportunities->count(),
            'active' => $opportunities->where('status', Status::ACTIVE)->count(),
            'pending' => $opportunities->where('status', Status::PENDING_REVIEW)->count(),
            'closed' => $opportunities->where('status', Status::CLOSED)->count(),
        ];
    }

    /**
     * Get paginated opportunities with search and sorting
     */
    public function getPaginated(array $searchFilters = [], array $sortFilters = []): LengthAwarePaginator
    {
        $query = $this->queryBuilder->buildBaseQuery();
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Get user's opportunities paginated
     */
    public function getUserOpportunitiesPaginated(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildUserOpportunitiesQuery($user->id);
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Get active opportunities paginated
     */
    public function getActiveOpportunitiesPaginated(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildActiveOpportunitiesQuery();
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Search opportunities with filters
     */
    public function search(array $filters): Collection
    {
        $query = $this->queryBuilder->buildBaseQuery();
        $query = $this->queryBuilder->applySearchFilters($query, $filters);
        return $query->orderBy('created_at', 'desc')->get();
    }
}
