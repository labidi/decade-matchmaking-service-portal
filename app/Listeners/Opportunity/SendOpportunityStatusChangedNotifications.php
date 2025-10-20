<?php

declare(strict_types=1);

namespace App\Listeners\Opportunity;

use App\Enums\Opportunity\Status;
use App\Events\Opportunity\OpportunityStatusChanged;
use App\Jobs\Email\SendTransactionalEmail;
use App\Models\SystemNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener for OpportunityStatusChanged event.
 *
 * Handles:
 * - Creating in-app notification for opportunity creator
 * - Sending email to opportunity creator
 */
class SendOpportunityStatusChangedNotifications implements ShouldQueue
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
        $previousStatus = $event->previousStatus;
        $newStatus = $event->newStatus;

        try {
            $previousStatusLabel = $this->getStatusLabel($previousStatus);
            $newStatusLabel = $newStatus->label();

            // Send email to opportunity creator
            if ($opportunity->user) {
                dispatch(new SendTransactionalEmail(
                    'opportunity.updated',
                    $opportunity->user,
                    [
                        'Opportunity_Title' => $opportunity->title,
                        'Opportunity_Link' => route('opportunity.show', $opportunity->id),
                        'user_name' => $opportunity->user->name,
                        'Previous_Status' => $previousStatusLabel,
                        'Current_Status' => $newStatusLabel,
                        'UNSUB' => route('unsubscribe.show', $opportunity->user->id),
                        'UPDATE_PROFILE' => route('notification.preferences.index'),
                    ]
                ));
            }
        } catch (\Exception $e) {
            return ;
        }
    }

    /**
     * Get status label from status value.
     *
     * @param mixed $status The status value
     * @return string The status label
     */
    private function getStatusLabel(mixed $status): string
    {
        if ($status instanceof Status) {
            return $status->label();
        }

        if (is_numeric($status)) {
            $statusEnum = Status::tryFrom((int) $status);
            return $statusEnum ? $statusEnum->label() : 'Unknown';
        }

        return 'Unknown';
    }
}
