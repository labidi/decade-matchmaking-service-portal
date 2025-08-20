<?php

namespace App\Services;

use App\Enums\Opportunity\Status;
use App\Models\Opportunity;
use App\Models\User;
use App\Services\Opportunity\EnhancerService;
use App\Services\Opportunity\OpportunityAnalyticsService;
use App\Services\Opportunity\OpportunityQueryBuilder;
use App\Services\Opportunity\OpportunityRepository;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OpportunityService
{
    public function __construct(
        private readonly OpportunityRepository $repository,
        private readonly OpportunityAnalyticsService $analytics,
        private readonly OpportunityQueryBuilder $queryBuilder
    ) {
    }

    /**
     * Create a new opportunity
     * @throws \Throwable
     */
    public function createOpportunity(array $data, User $user): Opportunity
    {
        return DB::transaction(function () use ($data, $user) {
            return $this->repository->create($data, $user);
        });
    }

    /**
     * Get paginated opportunities submitted by a specific user
     */
    public function getUserOpportunitiesPaginated(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildUserOpportunitiesQuery($user->id);
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        
        $opportunities = $this->queryBuilder->applyPagination($query, $sortFilters);
        $opportunities->getCollection()->transform(function ($opportunity) {
            // Enhance opportunity data if needed
            return EnhancerService::enhanceOpportunity($opportunity);
        });
        return $opportunities;
    }


    public function getAllOpportunitiesPaginated(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildBaseQuery();
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        
        $opportunities = $this->queryBuilder->applyPagination($query, $sortFilters);
        $opportunities->getCollection()->transform(function ($opportunity) {
            // Enhance opportunity data if needed
            return EnhancerService::enhanceOpportunity($opportunity);
        });
        return $opportunities;
    }

    /**
     * Get paginated active opportunities (active status only)
     */
    public function getActiveOpportunitiesPaginated(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildActiveOpportunitiesQuery();
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        
        $opportunities = $this->queryBuilder->applyPagination($query, $sortFilters);
        $opportunities->getCollection()->transform(function ($opportunity) {
            // Enhance opportunity data if needed
            return EnhancerService::enhanceOpportunity($opportunity);
        });
        return $opportunities;
    }

    /**
     * Find opportunity by ID with authorization check
     */
    public function findOpportunity(int $id): ?Opportunity
    {
        $opportunity = $this->repository->findById($id);
        if (!$opportunity) {
            return null;
        }
        return $opportunity;
    }

    /**
     * Update opportunity status
     * @throws Exception
     */
    public function updateOpportunityStatus(int $opportunityId, int $statusCode, User $user): array
    {
        $opportunity = $this->findOpportunity($opportunityId, $user);
        if (!$opportunity) {
            throw new Exception('Opportunity not found', 404);
        }
        // Validate status
        if (!in_array($statusCode, array_column(Status::cases(), 'value'))) {
            throw new Exception('Invalid status code', 422);
        }
        // Check if user can update this opportunity
        if ($opportunity->user_id !== $user->id) {
            throw new Exception('Unauthorized to update this opportunity', 403);
        }
        $this->repository->update($opportunity, ['status' => $statusCode]);
        return [
            'opportunity' => $opportunity->fresh(),
            'status' => [
                'status_code' => (string)$statusCode,
                'status_label' => Opportunity::STATUS_LABELS[$statusCode] ?? ''
            ]
        ];
    }

    /**
     * Delete opportunity with validation
     */
    public function deleteOpportunity(int $opportunityId, User $user): bool
    {
        $opportunity = $this->findOpportunity($opportunityId, $user);

        if (!$opportunity) {
            throw new Exception('Opportunity not found', 404);
        }

        // Check ownership
        if ($opportunity->user_id !== $user->id) {
            throw new Exception('Unauthorized to delete this opportunity', 403);
        }

        // Check if can be deleted (only pending review)
        if ($opportunity->status !== Status::PENDING_REVIEW) {
            throw new Exception('Only pending review opportunities can be deleted', 422);
        }

        $deleted = $this->repository->delete($opportunity);

        if ($deleted) {
            Log::info('Opportunity deleted', [
                'opportunity_id' => $opportunityId,
                'user_id' => $user->id,
                'title' => $opportunity->title
            ]);
        }

        return $deleted;
    }

    /**
     * Get opportunity statistics
     */
    public function getOpportunityStats(User $user): array
    {
        return $this->analytics->getUserOpportunityStats($user);
    }

    /**
     * Search opportunities with filters
     */
    public function searchOpportunities(array $filters, User $user): Collection
    {
        // Handle public opportunities filter (exclude user's own opportunities)
        if (!empty($filters['public'])) {
            $query = $this->queryBuilder->buildPublicOpportunitiesQuery($user->id);
        } else {
            $query = $this->queryBuilder->buildBaseQuery();
        }
        
        $query = $this->queryBuilder->applySearchFilters($query, $filters);
        return $query->orderBy('created_at', 'desc')->get();
    }
}
