<?php

namespace App\Events\Opportunity;

use App\Enums\Opportunity\Status;
use App\Models\Opportunity;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OpportunityStatusChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public readonly Opportunity $opportunity,
        public readonly mixed $previousStatus,
        public readonly Status $newStatus
    ) {
    }

    /**
     * Determine if status was approved.
     */
    public function wasApproved(): bool
    {
        return $this->getPreviousStatusEnum() === Status::PENDING_REVIEW 
            && $this->newStatus === Status::ACTIVE;
    }

    /**
     * Determine if status was rejected.
     */
    public function wasRejected(): bool
    {
        return $this->newStatus === Status::REJECTED;
    }

    /**
     * Get previous status as enum if possible.
     */
    public function getPreviousStatusEnum(): ?Status
    {
        if ($this->previousStatus instanceof Status) {
            return $this->previousStatus;
        }
        
        if (is_numeric($this->previousStatus)) {
            return Status::tryFrom((int) $this->previousStatus);
        }
        
        return null;
    }

}