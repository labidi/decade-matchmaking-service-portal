<?php

namespace App\Listeners\Opportunity;

use App\Events\Opportunity\OpportunityCreated;
use App\Mail\OpportunityPublished;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOpportunityCreatedNotifications implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The name of the queue the job should be sent to.
     */
    public string $queue = 'mail-priority';

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle the event.
     */
    public function handle(OpportunityCreated $event): void
    {
        $opportunity = $event->opportunity;

        try {
            // Send confirmation to opportunity creator
            if ($opportunity->user && $opportunity->user->email) {
                Mail::to($opportunity->user->email)
                    ->queue(new OpportunityPublished($opportunity, 'creator'));
            }

            // Notify administrators
            $this->notifyAdministrators($opportunity);

            Log::info('Opportunity created notifications sent', [
                'opportunity_id' => $opportunity->id,
                'creator_notified' => (bool) $opportunity->user,
            ]);
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
        $admins = User::where('administrator', true)
            ->whereNotNull('email')
            ->get();

        foreach ($admins as $admin) {
            Mail::to($admin->email)
                ->queue(new OpportunityPublished($opportunity, 'admin'));
        }
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
