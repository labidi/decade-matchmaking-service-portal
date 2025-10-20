<?php

declare(strict_types=1);

namespace App\Observers;

use App\Events\Opportunity\OpportunityClosingDateExtended;
use App\Events\Opportunity\OpportunityCreated;
use App\Events\Opportunity\OpportunityDeleted;
use App\Events\Opportunity\OpportunityStatusChanged;
use App\Events\Opportunity\OpportunityUpdated;
use App\Models\Opportunity;

/**
 * Observer for Opportunity model.
 *
 * This observer follows the Single Responsibility Principle:
 * - Only checks conditions and dispatches events
 * - All business logic moved to event listeners
 */
class OpportunityObserver
{
    /**
     * Handle the Opportunity "created" event.
     *
     * @param Opportunity $opportunity The newly created opportunity
     * @return void
     */
    public function created(Opportunity $opportunity): void
    {
        OpportunityCreated::dispatch($opportunity);
    }

    /**
     * Handle the Opportunity "updated" event.
     *
     * @param Opportunity $opportunity The updated opportunity
     * @return void
     */
    public function updated(Opportunity $opportunity): void
    {
        if ($opportunity->isDirty('status')) {
            OpportunityStatusChanged::dispatch(
                $opportunity,
                $opportunity->getOriginal('status'),
                $opportunity->getAttribute('status')
            );
        }

        // Handle closing date extension
        if ($opportunity->isDirty('closing_date')) {
            OpportunityClosingDateExtended::dispatch($opportunity);
        }

        // Dispatch general update event for all other changes
        if (!$opportunity->isDirty('status') && !$opportunity->isDirty('closing_date')) {
            OpportunityUpdated::dispatch($opportunity);
        }
    }

    /**
     * Handle the Opportunity "deleting" event.
     *
     * @param Opportunity $opportunity The opportunity being deleted
     * @return void
     */
    public function deleting(Opportunity $opportunity): void
    {
        OpportunityDeleted::dispatch($opportunity);
    }


}
