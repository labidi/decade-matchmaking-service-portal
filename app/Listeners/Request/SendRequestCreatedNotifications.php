<?php

declare(strict_types=1);

namespace App\Listeners\Request;

use App\Events\Request\RequestCreated;
use App\Jobs\Email\SendTransactionalEmail;
use App\Models\SystemNotification;
use App\Services\UserService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Listener for RequestCreated event.
 *
 * Handles:
 * - Creating in-app notification for admins
 * - Sending confirmation email to requester
 */
class SendRequestCreatedNotifications implements ShouldQueue
{
    public function __construct(private readonly UserService $userService) {}

    /**
     * Handle the event.
     *
     * @param  RequestCreated  $event  The request created event
     */
    public function handle(RequestCreated $event): void
    {
        $request = $event->request;

        try {

            foreach ($this->userService->getAllAdmins() as $admin) {
                SystemNotification::create([
                    'user_id' => $admin->id,
                    'title' => 'New Request Submitted',
                    'description' => sprintf(
                        'A new request has been submitted: %s By %s',
                        $request->capacity_development_title ?? $request->id,
                        $request->user->name ?? 'Unknown User'
                    ),
                    'is_read' => false,
                ]);
            }

            // Send confirmation email to requester
            if ($request->user) {
                dispatch(new SendTransactionalEmail(
                    'request.created',
                    $request->user,
                    [
                        'Request_Title' => $request->capacity_development_title ?? 'N/A',
                        'Request_Link' => route('request.show', $request->id),
                        'user_name' => $request->user->name,
                        'UNSUB' => route('unsubscribe.show', $request->user->id),
                        'UPDATE_PROFILE' => route('notification.preferences.index'),
                    ]
                ));
            }

            Log::info('Request created notifications sent', [
                'request_id' => $request->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send request created notifications', [
                'request_id' => $request->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
