<?php

namespace App\Observers;

use App\Enums\Opportunity\Status;
use App\Events\Opportunity\OpportunityCreated;
use App\Events\Opportunity\OpportunityStatusChanged;
use App\Models\Notification;
use App\Models\Opportunity;
use App\Services\NotificationService;
use Exception;
use Illuminate\Support\Facades\Log;

class OpportunityObserver
{
    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    /**
     * Handle the Opportunity "created" event.
     */
    public function created(Opportunity $opportunity): void
    {
        try {
            // Create in-app notification for admins
            $this->createAdminNotification($opportunity, 'created');

            // Dispatch event for further processing
            OpportunityCreated::dispatch($opportunity);

            // Send notifications based on user preferences
            $notificationsSent = $this->notificationService->notifyUsersForNewOpportunity($opportunity);

            Log::info('Opportunity created event processed', [
                'opportunity_id' => $opportunity->id,
                'notifications_sent' => count($notificationsSent),
            ]);
        } catch (Exception $e) {
            Log::error('Failed to process opportunity created event', [
                'opportunity_id' => $opportunity->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Handle the Opportunity "updated" event.
     */
    public function updated(Opportunity $opportunity): void
    {
        // Check if status has changed
        if ($opportunity->isDirty('status')) {
            $originalStatus = $opportunity->getOriginal('status');

            try {
                // Create notification for status change
                $this->createStatusChangeNotification($opportunity, $originalStatus);

                // Dispatch status change event
                OpportunityStatusChanged::dispatch(
                    $opportunity,
                    $originalStatus,
                    $opportunity->status
                );
            } catch (Exception $e) {
                Log::error('Failed to process opportunity status change', [
                    'opportunity_id' => $opportunity->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Handle closing date extension
        if ($opportunity->isDirty('closing_date')) {
            $this->handleClosingDateChange($opportunity);
        }
    }

    /**
     * Handle the Opportunity "deleting" event.
     */
    public function deleting(Opportunity $opportunity): void
    {
        Log::info('Opportunity being deleted', [
            'opportunity_id' => $opportunity->id,
            'title' => $opportunity->title,
        ]);
    }

    /**
     * Create admin notification for opportunity events.
     */
    private function createAdminNotification(Opportunity $opportunity, string $event): void
    {
        $title = match ($event) {
            'created' => 'New Opportunity Published',
            default => 'Opportunity Event'
        };

        Notification::create([
            'user_id' => 3, // Admin user ID
            'title' => $title,
            'description' => sprintf(
                'A new opportunity "%s" has been published by %s',
                $opportunity->title,
                $opportunity->user->name ?? 'Unknown User'
            ),
            'is_read' => false,
        ]);
    }

    /**
     * Create notification for status changes.
     */
    private function createStatusChangeNotification(
        Opportunity $opportunity,
        mixed $originalStatus
    ): void {
        // Notify opportunity creator
        if ($opportunity->user_id) {
            Notification::create([
                'user_id' => $opportunity->user_id,
                'title' => 'Opportunity Status Updated',
                'description' => sprintf(
                    'Your opportunity "%s" status has been changed from %s to %s',
                    $opportunity->title,
                    $originalStatus ? $this->getStatusLabel($originalStatus) : 'N/A',
                    $opportunity->status->label()
                ),
                'is_read' => false,
            ]);
        }
    }

    /**
     * Handle closing date changes.
     */
    private function handleClosingDateChange(Opportunity $opportunity): void
    {
        $originalDate = $opportunity->getOriginal('closing_date');
        $newDate = $opportunity->closing_date;

        if ($originalDate && $newDate && $newDate->gt($originalDate)) {
            Log::info('Opportunity closing date extended', [
                'opportunity_id' => $opportunity->id,
                'original_date' => $originalDate->format('Y-m-d'),
                'new_date' => $newDate->format('Y-m-d'),
                'extension_days' => $originalDate->diffInDays($newDate),
            ]);
        }
    }

    /**
     * Get status label from status value.
     */
    private function getStatusLabel(mixed $status): string
    {
        if (is_object($status) && method_exists($status, 'label')) {
            return $status->label();
        }

        // Handle case where status might be an integer
        if (is_numeric($status)) {
            return Status::getLabelByValue($status) ?? 'Unknown';
        }

        return 'Unknown';
    }
}
