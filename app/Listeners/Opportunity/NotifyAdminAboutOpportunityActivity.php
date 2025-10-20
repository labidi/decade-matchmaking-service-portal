<?php

declare(strict_types=1);

namespace App\Listeners\Opportunity;

use App\Events\Opportunity\OpportunityClosingDateExtended;
use App\Events\Opportunity\OpportunityCreated;
use App\Events\Opportunity\OpportunityDeleted;
use App\Events\Opportunity\OpportunityStatusChanged;
use App\Events\Opportunity\OpportunityUpdated;
use App\Models\Opportunity;
use App\Services\SystemNotificationService;
use Carbon\Carbon;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Facades\Log;

/**
 * Listener for opportunity activity events.
 *
 * Creates admin notifications for all opportunity lifecycle events:
 * - OpportunityCreated
 * - OpportunityUpdated
 * - OpportunityClosingDateExtended
 * - OpportunityDeleted
 * - OpportunityStatusChanged
 */
class NotifyAdminAboutOpportunityActivity
{
    /**
     * Create the event listener.
     */
    public function __construct(
        private readonly SystemNotificationService $notificationService
    ) {
    }

    /**
     * Register the listeners for the subscriber.
     *
     * @param Dispatcher $events
     * @return void
     */
    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            OpportunityCreated::class,
            [self::class, 'handleOpportunityCreated']
        );

        $events->listen(
            OpportunityUpdated::class,
            [self::class, 'handleOpportunityUpdated']
        );

        $events->listen(
            OpportunityClosingDateExtended::class,
            [self::class, 'handleClosingDateExtended']
        );

        $events->listen(
            OpportunityDeleted::class,
            [self::class, 'handleOpportunityDeleted']
        );

        $events->listen(
            OpportunityStatusChanged::class,
            [self::class, 'handleStatusChanged']
        );
    }

    /**
     * Handle opportunity created event.
     *
     * @param OpportunityCreated $event
     * @return void
     */
    public function handleOpportunityCreated(OpportunityCreated $event): void
    {
        $this->notificationService->notifyAdmins(
            'New Opportunity Created',
            sprintf(
                'New opportunity "%s" has been created by %s',
                $event->opportunity->title,
                $event->opportunity->user->name ?? 'Unknown User'
            )
        );
    }

    /**
     * Handle opportunity updated event.
     *
     * @param OpportunityUpdated $event
     * @return void
     */
    public function handleOpportunityUpdated(OpportunityUpdated $event): void
    {
        $this->notificationService->notifyAdmins(
            'Opportunity Updated',
            sprintf(
                'Opportunity "%s" has been updated',
                $event->opportunity->title
            )
        );
    }

    /**
     * Handle closing date extended event.
     *
     * @param OpportunityClosingDateExtended $event
     * @return void
     */
    public function handleClosingDateExtended(OpportunityClosingDateExtended $event): void
    {
        $originalDate = $event->opportunity->getOriginal('closing_date');
        $newDate = $event->opportunity->getAttribute('closing_date');
        $extensionDays = (int) $originalDate->diffInDays($newDate);
        $this->notificationService->notifyAdmins(
            'Opportunity Closing Date Extended',
            sprintf(
                'Opportunity "%s" closing date extended by %d days (new date: %s)',
                $event->opportunity->title,
                $extensionDays,
                $newDate->format('Y-m-d')
            )
        );
    }

    /**
     * Handle opportunity deleted event.
     *
     * @param OpportunityDeleted $event
     * @return void
     */
    public function handleOpportunityDeleted(OpportunityDeleted $event): void
    {
        $this->notificationService->notifyAdmins(
            'Opportunity Deleted',
            sprintf(
                'Opportunity "%s" has been deleted',
                $event->opportunity->title
            )
        );
    }

    /**
     * Handle status changed event.
     *
     * @param OpportunityStatusChanged $event
     * @return void
     */
    public function handleStatusChanged(OpportunityStatusChanged $event): void
    {
        $this->notificationService->notifyAdmins(
            'Opportunity Status Changed',
            sprintf(
                'Opportunity "%s" status changed from %s to %s',
                $event->opportunity->title,
                $event->getPreviousStatusEnum()?->label() ?? 'none',
                $event->newStatus->label()
            )
        );
    }
}