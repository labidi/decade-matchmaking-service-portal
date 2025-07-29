<?php

namespace App\Services;

use App\Enums\OpportunityStatus;
use App\Models\Opportunity;
use App\Models\User;
use App\Services\Opportunity\OpportunityAnalyticsService;
use App\Services\Opportunity\OpportunityRepository;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OpportunityService
{
    public function __construct(
        private readonly OpportunityRepository $repository,
        private readonly OpportunityAnalyticsService $analytics
    ) {
    }

    /**
     * Create a new opportunity
     */
    public function createOpportunity(array $data, User $user): Opportunity
    {
        return DB::transaction(function () use ($data, $user) {
            $opportunity = $this->repository->create($data, $user);

            Log::info('Opportunity created', [
                'opportunity_id' => $opportunity->id,
                'user_id' => $user->id,
                'title' => $opportunity->title
            ]);

            return $opportunity;
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
     * Get public opportunities (active status only)
     */
    public function getPublicOpportunities(): Collection
    {
        return $this->repository->getPublicOpportunities();
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

        $oldStatus = $opportunity->status;
        $this->repository->update($opportunity, ['status' => $statusCode]);

        Log::info('Opportunity status updated', [
            'opportunity_id' => $opportunity->id,
            'user_id' => $user->id,
            'old_status' => $oldStatus,
            'new_status' => $statusCode
        ]);

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
        return $this->repository->searchWithFilters($filters, $user);
    }

    /**
     * Get system-wide opportunity analytics
     */
    public function getSystemAnalytics(): array
    {
        return $this->analytics->getSystemStats();
    }

    /**
     * Get user performance metrics
     */
    public function getUserPerformanceMetrics(User $user): array
    {
        return $this->analytics->getUserPerformanceMetrics($user);
    }

    /**
     * Get trending opportunities
     */
    public function getTrendingOpportunities(int $days = 30, int $limit = 10): array
    {
        return $this->analytics->getTrendingOpportunities($days, $limit);
    }
}
