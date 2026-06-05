<?php

declare(strict_types=1);

namespace App\Listeners\Opportunity;

use App\Events\Opportunity\OpportunityStatusChanged;
use App\Notifications\Opportunity\OpportunityStatusChangedNotification;

/**
 * Listener for OpportunityStatusChanged event.
 *
 * Handles:
 * - Creating in-app notification for opportunity creator
 * - Sending email to opportunity creator
 */
class SendOpportunityStatusChangedNotifications
{
    /**
     * Handle the event.
     *
     * @param OpportunityStatusChanged $event The opportunity status changed event
     * @return void
     */
    public function handle(OpportunityStatusChanged $event): void
    {
        $opportunity = $event->opportunity;

        try {
            // Send email to opportunity creator
            if ($opportunity->user) {
                $opportunity->user->notify(new OpportunityStatusChangedNotification(
                    $opportunity,
                    $event->previousStatus,
                    $event->newStatus
                ));
            }
        } catch (\Exception $e) {
            return;
        }
    }
}
