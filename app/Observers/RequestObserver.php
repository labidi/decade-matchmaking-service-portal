<?php

declare(strict_types=1);

namespace App\Observers;

use App\Events\Request\RequestCreated;
use App\Events\Request\RequestDeleted;
use App\Events\Request\RequestPartnerMatched;
use App\Events\Request\RequestStatusChanged;
use App\Events\Request\RequestValidated;
use App\Models\Request;
use Illuminate\Support\Facades\Log;

/**
 * Observer for Request model.
 *
 * This observer follows the Single Responsibility Principle:
 * - Only checks conditions and dispatches events
 * - All business logic moved to event listeners
 */
class RequestObserver
{
    /**
     * Handle the Request "created" event.
     *
     * @param Request $request The newly created request
     * @return void
     */
    public function created(Request $request): void
    {
        RequestCreated::dispatch($request);
    }

    /**
     * Handle the Request "updated" event.
     *
     * @param Request $request The updated request
     * @return void
     */
    public function updated(Request $request): void
    {
        // Check if status has changed
        if ($request->isDirty('status_id')) {
            $previousStatus = $this->getPreviousStatus($request);
            RequestStatusChanged::dispatch($request, $previousStatus);
        }
    }

    /**
     * Handle the Request "deleting" event.
     *
     * @param Request $request The request being deleted
     * @return void
     */
    public function deleting(Request $request): void
    {
        RequestDeleted::dispatch($request);
    }

    /**
     * Get the previous status label.
     *
     * @param Request $request The request with changed status
     * @return string|null The previous status label
     */
    private function getPreviousStatus(Request $request): ?string
    {
        $originalStatusId = $request->getOriginal('status_id');

        if (! $originalStatusId) {
            return null;
        }

        $previousStatus = \App\Models\Request\Status::find($originalStatusId);

        return $previousStatus?->status_label;
    }
}
