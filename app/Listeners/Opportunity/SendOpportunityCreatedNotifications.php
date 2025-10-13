<?php

namespace App\Listeners\Opportunity;

use App\Events\Opportunity\OpportunityCreated;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOpportunityCreatedNotifications
{

    /**
     * Handle the event.
     */
    public function handle(OpportunityCreated $event): void
    {
        $opportunity = $event->opportunity;

        try {

        } catch (\Exception $e) {
            Log::error('Failed to send opportunity created notifications', [
                'opportunity_id' => $opportunity->id,
                'error' => $e->getMessage(),
            ]);

            // Re-throw to trigger retry
            throw $e;
        }
    }

    /**
     * Notify administrators about new opportunity.
     */
    private function notifyAdministrators($opportunity): void
    {

    }

    /**
     * Handle a job failure.
     */
    public function failed(OpportunityCreated $event, \Throwable $exception): void
    {
        Log::critical('Failed to send opportunity created notifications after retries', [
            'opportunity_id' => $event->opportunity->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
