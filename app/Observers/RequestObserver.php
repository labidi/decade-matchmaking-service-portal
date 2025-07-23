<?php

namespace App\Observers;

use App\Models\Request;
use App\Models\Notification;
use App\Services\MailService;
use Illuminate\Support\Facades\Log;

class RequestObserver
{
    protected MailService $mailService;

    public function __construct(MailService $mailService)
    {
        $this->mailService = $mailService;
    }

    /**
     * Handle the Request "created" event.
     */
    public function created(Request $request): void
    {
        // Create notification (existing functionality)
        Notification::create([
            'user_id' => 3,
            'title' => 'New Request Submitted',
            'description' => 'A new request has been submitted: ' . ($request->capacity_development_title ?? $request->id),
            'is_read' => false,
        ]);

        // Send email notifications
        try {
            $this->mailService->sendNewRequestSubmitted($request);
        } catch (\Exception $e) {
            Log::error('Failed to send new request emails in observer', [
                'request_id' => $request->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle the Request "updated" event.
     */
    public function updated(Request $request): void
    {
        // Check if status has changed
        if ($request->isDirty('status_id')) {
            $originalStatusId = $request->getOriginal('status_id');
            $previousStatus = null;

            if ($originalStatusId) {
                $previousStatus = \App\Models\Request\Status::find($originalStatusId)?->status_label;
            }

            try {
                $this->mailService->sendRequestStatusChanged($request, $previousStatus);
            } catch (\Exception $e) {
                Log::error('Failed to send status change emails in observer', [
                    'request_id' => $request->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Check if matched partner has been assigned
        if ($request->isDirty('matched_partner_id') && $request->matched_partner_id) {
            try {
                $partner = $request->matchedPartner;
                if ($partner) {
                    $this->mailService->sendRequestMatchedWithPartner($request, $partner);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send matching emails in observer', [
                    'request_id' => $request->id,
                    'partner_id' => $request->matched_partner_id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Handle the Request "deleting" event.
     */
    public function deleting(Request $request): void
    {
        // Optional: Send notification when request is being deleted
        Log::info('Request being deleted', ['request_id' => $request->id]);
    }
}
