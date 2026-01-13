<?php

namespace App\Listeners\Request;

use App\Events\Request\RequestExpressInterest;
use App\Jobs\Email\SendTransactionalEmail;
use App\Services\SystemNotificationService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

readonly class ExpressInterestListener implements ShouldQueue
{
    public function __construct(
        private SystemNotificationService $systemNotificationService
    ) {}

    /**
     * @param RequestExpressInterest $event
     * @return void
     */
    public function handle(RequestExpressInterest $event): void
    {
        try {
            $request = $event->request;
            $partner = $event->partner;
            $this->systemNotificationService->notifyAdmins(
                'Request Interest Expressed',
                sprintf(
                    'A partner has expressed interest in a request: %s By Partner %s',
                    $request->detail->capacity_development_title ?? $request->id,
                    $partner->name ?? 'Unknown Partner'
                )
            );
        } catch (Exception $exception) {
            Log::error('Error during handling partner express interest', [
                'request_id' => $request->id,
                'error' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);
        }
    }
}
