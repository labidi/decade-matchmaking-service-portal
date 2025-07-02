<?php

namespace App\Services;

use App\Enums\OpportunityStatus;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class OpportunityService
{
    /**
     * Create a new opportunity
     */
    public function createOpportunity(array $data, User $user): Opportunity
    {
        return DB::transaction(function () use ($data, $user) {
            $opportunity = new Opportunity($data);
            $opportunity->user_id = $user->id;
            $opportunity->status = OpportunityStatus::PENDING_REVIEW;
            $opportunity->save();

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
        return Opportunity::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get public opportunities (excluding current user's)
     */
    public function getPublicOpportunities(User $user): Collection
    {
        return Opportunity::where(function (Builder $query) use ($user) {
            $query->where('user_id', '!=', $user->id)
                ->where('status', OpportunityStatus::ACTIVE);
        })
        ->orderBy('created_at', 'desc')
        ->get();
    }

    /**
     * Find opportunity by ID with authorization check
     */
    public function findOpportunity(int $id, ?User $user = null): ?Opportunity
    {
        $opportunity = Opportunity::find($id);
        
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
        $opportunity->status = $statusCode;
        $opportunity->save();

        Log::info('Opportunity status updated', [
            'opportunity_id' => $opportunity->id,
            'user_id' => $user->id,
            'old_status' => $oldStatus,
            'new_status' => $statusCode
        ]);

        return [
            'opportunity' => $opportunity,
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

        $deleted = $opportunity->delete();

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
        $userOpportunities = $this->getUserOpportunities($user);
        
        return [
            'total' => $userOpportunities->count(),
            'active' => $userOpportunities->where('status', OpportunityStatus::ACTIVE)->count(),
            'pending' => $userOpportunities->where('status', OpportunityStatus::PENDING_REVIEW)->count(),
            'closed' => $userOpportunities->where('status', OpportunityStatus::CLOSED)->count(),
        ];
    }

    /**
     * Search opportunities with filters
     */
    public function searchOpportunities(array $filters, User $user): Collection
    {
        $query = Opportunity::query();

        // Apply filters
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['location'])) {
            $query->where('implementation_location', 'like', '%' . $filters['location'] . '%');
        }

        // Exclude user's own opportunities for public search
        if (isset($filters['public']) && $filters['public']) {
            $query->where('user_id', '!=', $user->id)
                  ->where('status', OpportunityStatus::ACTIVE);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }
} 