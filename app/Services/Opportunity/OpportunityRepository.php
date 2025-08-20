<?php

namespace App\Services\Opportunity;

use App\Enums\Opportunity\OpportunityStatus;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class OpportunityRepository
{
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
     * Get public opportunities (active status only)
     */
    public function getPublicOpportunities(): Collection
    {
        return Opportunity::where('status', OpportunityStatus::ACTIVE)
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
            'active' => $opportunities->where('status', OpportunityStatus::ACTIVE)->count(),
            'pending' => $opportunities->where('status', OpportunityStatus::PENDING_REVIEW)->count(),
            'closed' => $opportunities->where('status', OpportunityStatus::CLOSED)->count(),
        ];
    }
}
