<?php

namespace App\Services\Opportunity;

use App\Enums\OpportunityStatus;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OpportunityRepository
{
    public function __construct(
        private readonly OpportunityQueryBuilder $queryBuilder
    ) {
    }

    /**
     * Create a new opportunity
     */
    public function create(array $data, User $user): Opportunity
    {
        $opportunity = new Opportunity($data);
        $opportunity->user_id = $user->id;
        $opportunity->status = OpportunityStatus::PENDING_REVIEW;
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
     * Get paginated opportunities submitted by a specific user
     */
    public function getUserOpportunitiesPaginated(User $user, array $searchFilters, array $sortFilters): LengthAwarePaginator
    {
        $query = $this->queryBuilder->buildBaseQuery();
        $query = $this->queryBuilder->filterByOwnership($query, $user, true);
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        $query = $this->queryBuilder->withRelations($query);
        
        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Get public opportunities (active status only)
     */
    public function getPublicOpportunities(): Collection
    {
        return Opportunity::where('status', OpportunityStatus::ACTIVE)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get paginated public opportunities (active status only)
     */
    public function getPublicOpportunitiesPaginated(array $searchFilters, array $sortFilters): LengthAwarePaginator
    {
        $query = $this->queryBuilder->buildBaseQuery();
        $query = $this->queryBuilder->filterByActiveStatus($query);
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        $query = $this->queryBuilder->withRelations($query);
        
        return $this->queryBuilder->applyPagination($query, $sortFilters);
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
     * Search opportunities with filters
     */
    public function searchWithFilters(array $filters, User $user): Collection
    {
        $query = $this->queryBuilder->buildBaseQuery();
        $query = $this->queryBuilder->applyFilters($query, $filters, $user);
        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get opportunities count by status for a user
     */
    public function getCountByStatus(User $user): array
    {
        $opportunities = $this->getByUser($user);

        return [
            'total' => $opportunities->count(),
            'active' => $opportunities->where('status', OpportunityStatus::ACTIVE)->count(),
            'pending' => $opportunities->where('status', OpportunityStatus::PENDING_REVIEW)->count(),
            'closed' => $opportunities->where('status', OpportunityStatus::CLOSED)->count(),
        ];
    }
}
