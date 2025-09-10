<?php

namespace App\Listeners\Opportunity;

use App\Events\Opportunity\OpportunityCreated;
use App\Events\Opportunity\OpportunityStatusChanged;
use Illuminate\Support\Facades\Log;

class LogOpportunityActivity
{
    /**
     * Handle opportunity created events.
     */
    public function handleOpportunityCreated(OpportunityCreated $event): void
    {
        Log::channel('opportunity')->info('Opportunity created', [
            'opportunity_id' => $event->opportunity->id,
            'title' => $event->opportunity->title,
            'type' => $event->opportunity->type->label(),
            'created_by' => $event->opportunity->user_id,
            'closing_date' => $event->opportunity->closing_date?->format('Y-m-d'),
        ]);
    }

    /**
     * Handle opportunity status changed events.
     */
    public function handleStatusChanged(OpportunityStatusChanged $event): void
    {
        Log::channel('opportunity')->info('Opportunity status changed', [
            'opportunity_id' => $event->opportunity->id,
            'title' => $event->opportunity->title,
            'from_status' => $event->getPreviousStatusEnum()?->label() ?? 'none',
            'to_status' => $event->newStatus->label(),
            'changed_at' => now()->toIso8601String(),
        ]);
    }
}
