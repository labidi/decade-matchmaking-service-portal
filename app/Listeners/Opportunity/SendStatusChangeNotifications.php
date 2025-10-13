<?php

namespace App\Listeners\Opportunity;

use App\Events\Opportunity\OpportunityStatusChanged;
use App\Jobs\Email\SendTransactionalEmail;
use App\Models\User;
use App\Services\UserService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendStatusChangeNotifications
{
    public function __construct(private readonly  UserService $userService)
    {
    }


    /**
     * Handle the event.
     * @throws Exception
     */
    public function handle(OpportunityStatusChanged $event): void
    {
        $opportunity = $event->opportunity;

        try {
            // Always notify opportunity creator about status changes
            if ($opportunity->user && $opportunity->user->email) {

            }

        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(OpportunityStatusChanged $event, Throwable $exception): void
    {
        Log::critical('Failed to send status change notifications after retries', [
            'opportunity_id' => $event->opportunity->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
