<?php

namespace App\Services;

use App\Enums\OpportunityStatus;
use App\Models\Opportunity;
use App\Models\User;
use App\Services\Opportunity\OpportunityAnalyticsService;
use App\Services\Opportunity\OpportunityRepository;
use App\Services\PaginationService;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OpportunityService
{
    public function __construct(
        private readonly OpportunityRepository $repository,
        private readonly OpportunityAnalyticsService $analytics,
        private readonly PaginationService $paginationService
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
     * Get opportunities submitted by a specific user
     */
    public function getUserOpportunities(User $user): Collection
    {
        return $this->repository->getByUser($user);
    }

    /**
     * Get paginated opportunities submitted by a specific user
     */
    public function getUserOpportunitiesPaginated(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->getBaseOpportunitiesQuery($searchFilters)
            ->where('user_id', $user->id);
        $query = $this->paginationService->applySorting($query, $sortFilters);
        return $this->paginationService->paginate($query, ['per_page' => 10]);
    }


    private function getBaseOpportunitiesQuery(array $searchFilters = []): Builder
    {
        $query = Opportunity::with(['user']);

        // Apply search filters (like OfferService pattern)
        if (!empty($searchFilters['title'])) {
            $query->where('title', 'like', '%' . $searchFilters['title'] . '%');
        }

        if (!empty($searchFilters['type'])) {
            $query->where('type', $searchFilters['type']);
        }

        if (!empty($searchFilters['location'])) {
            $query->where('implementation_location', 'like', '%' . $searchFilters['location'] . '%');
        }

        if (!empty($searchFilters['closing_date'])) {
            $query->whereDate('closing_date', '>=', $searchFilters['closing_date']);
        }

        if (!empty($searchFilters['user'])) {
            $query->whereHas('user', function ($q) use ($searchFilters) {
                $q->where('name', 'like', '%' . $searchFilters['user'] . '%')
                    ->orWhere('email', 'like', '%' . $searchFilters['user'] . '%');
            });
        }

        return $query;
    }

    public function getAllOpportunitiesPaginated(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->getBaseOpportunitiesQuery($searchFilters);
        $query = $this->paginationService->applySorting($query, $sortFilters);
        return $this->paginationService->paginate($query, ['per_page' => 10]);
    }

    /**
     * Get paginated active opportunities (active status only)
     */
    public function getActiveOpportunitiesPaginated(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->getBaseOpportunitiesQuery($searchFilters);
        $query->where('status', OpportunityStatus::ACTIVE);
        $query = $this->paginationService->applySorting($query, $sortFilters);
        return $this->paginationService->paginate($query, ['per_page' => 10]);
    }

    /**
     * Find opportunity by ID with authorization check
     */
    public function findOpportunity(int $id, ?User $user = null): ?Opportunity
    {
        $opportunity = $this->repository->findById($id);

        if (!$opportunity) {
            return null;
        }

        // If user is provided, check if they can access this opportunity
        if ($user && $opportunity->user_id !== $user->id) {
            // For now, allow access to public opportunities
            if ($opportunity->status !== OpportunityStatus::ACTIVE) {
                return null;
            }
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
        if (!in_array($statusCode, array_column(OpportunityStatus::cases(), 'value'))) {
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
        if ($opportunity->status !== OpportunityStatus::PENDING_REVIEW) {
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
        $query = Opportunity::with(['user']);

        // Apply filters (like OfferService pattern)
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['location'])) {
            $query->where('implementation_location', 'like', '%' . $filters['location'] . '%');
        }

        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                    ->orWhere('summary', 'like', '%' . $searchTerm . '%')
                    ->orWhere('keywords', 'like', '%' . $searchTerm . '%');
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Public opportunities filter (exclude user's own opportunities)
        if (!empty($filters['public'])) {
            $query->where('user_id', '!=', $user->id)
                ->where('status', OpportunityStatus::ACTIVE);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }
}
