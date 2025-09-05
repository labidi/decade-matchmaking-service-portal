<?php

namespace App\Listeners\Opportunity;

use App\Events\Opportunity\OpportunityStatusChanged;
use App\Mail\OpportunityStatusUpdated;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendStatusChangeNotifications implements ShouldQueue
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
    public function handle(OpportunityStatusChanged $event): void
    {
        $opportunity = $event->opportunity;
        
        try {
            // Always notify opportunity creator about status changes
            if ($opportunity->user && $opportunity->user->email) {
                Mail::to($opportunity->user->email)
                    ->queue(new OpportunityStatusUpdated(
                        $opportunity,
                        $event->getPreviousStatusEnum(),
                        $event->newStatus
                    ))
                    ->onQueue('mail-priority');
            }
            
            // Notify admins for specific status changes
            if ($this->shouldNotifyAdmins($event)) {
                $this->notifyAdministrators($event);
            }
            
            Log::info('Opportunity status change notifications sent', [
                'opportunity_id' => $opportunity->id,
                'from_status' => $event->getPreviousStatusEnum()?->label(),
                'to_status' => $event->newStatus->label()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send status change notifications', [
                'opportunity_id' => $opportunity->id,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Determine if administrators should be notified.
     */
    private function shouldNotifyAdmins(OpportunityStatusChanged $event): bool
    {
        // Notify admins when opportunity is approved or rejected
        return $event->wasApproved() || $event->wasRejected();
    }

    /**
     * Notify administrators about status change.
     */
    private function notifyAdministrators(OpportunityStatusChanged $event): void
    {
        $admins = User::where('administrator', true)
            ->whereNotNull('email')
            ->get();
        
        foreach ($admins as $admin) {
            Mail::to($admin->email)
                ->queue(new OpportunityStatusUpdated(
                    $event->opportunity,
                    $event->getPreviousStatusEnum(),
                    $event->newStatus,
                    'admin'
                ))
                ->onQueue('mail-priority');
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(OpportunityStatusChanged $event, \Throwable $exception): void
    {
        Log::critical('Failed to send status change notifications after retries', [
            'opportunity_id' => $event->opportunity->id,
            'error' => $exception->getMessage()
        ]);
    }
}