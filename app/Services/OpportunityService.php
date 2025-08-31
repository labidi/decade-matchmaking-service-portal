<?php

namespace App\Services;

use App\Enums\Opportunity\Status;
use App\Http\Resources\OpportunityResource;
use App\Models\Opportunity;
use App\Models\User;
use App\Services\Opportunity\OpportunityAnalyticsService;
use App\Services\Opportunity\OpportunityRepository;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

readonly class OpportunityService
{
    public function __construct(
        private OpportunityRepository $repository,
        private OpportunityAnalyticsService $analytics
    ) {
    }

    /**
     * Create a new opportunity
     * @throws Throwable
     */
    public function storeOpportunity(User $user, array $data, ?Opportunity $opportunity): Opportunity
    {
        return DB::transaction(function () use ($data, $user, $opportunity) {
            if ($opportunity) {
                $this->repository->update($opportunity, $data);
                return $opportunity->fresh();
            }
            $data += [
                'status' => Status::PENDING_REVIEW,
                'user_id' => $user->id
            ];
            return $this->repository->create($data);
        });
    }

    /**
     * Get paginated opportunities submitted by a specific user
     * @throws Throwable
     */
    public function getUserOpportunitiesPaginated(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $opportunities = $this->repository->getUserOpportunitiesPaginated($user, $searchFilters, $sortFilters);
        $opportunities->toResourceCollection(OpportunityResource::class);
        return $opportunities;
    }


    /**
     * @throws Throwable
     */
    public function getAllOpportunitiesPaginated(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $opportunities = $this->repository->getPaginated($searchFilters, $sortFilters);
        $opportunities->toResourceCollection(OpportunityResource::class);
        return $opportunities;
    }

    /**
     * Get paginated active opportunities (active status only)
     * @throws Throwable
     */
    public function getActiveOpportunitiesPaginated(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $opportunities = $this->repository->getActiveOpportunitiesPaginated($searchFilters, $sortFilters);
        $opportunities->toResourceCollection(OpportunityResource::class);
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
                'status_label' => Status::tryFrom($statusCode) ?? ''
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
        return $this->repository->search($filters);
    }

    public function extendOpportunityClosingDate(Opportunity $opportunity): Opportunity
    {
        $this->repository->update($opportunity, ['closing_date' => $opportunity->closing_date->addWeeks(2)]);
        return $opportunity->fresh();
    }
}
