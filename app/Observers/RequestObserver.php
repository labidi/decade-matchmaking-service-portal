<?php

namespace App\Observers;

use App\Models\Request;
use App\Models\Notification;
use App\Models\User;
use App\Mail\NewRequestSubmitted;
use App\Mail\RequestStatusChanged;
use App\Mail\RequestMatchedWithPartner;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class RequestObserver
{

    /**
     * Handle the Request "created" event.
     */
    public function created(Request $request): void
    {
        // Create notification (existing functionality)
        Notification::create([
            'user_id' => 3,
            'title' => 'New Request Submitted',
            'description' => 'A new request has been submitted: ' . ($request->capacity_development_title ?? $request->id) . ' By ' . ($request->user->name ?? 'Unknown User'),
            'is_read' => false,
        ]);
        // Send email notifications
        try {
            $this->sendNewRequestEmails($request);
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
                $this->sendStatusChangeEmails($request, $previousStatus);
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
                    $this->sendPartnerMatchingEmails($request, $partner);
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
     * Send emails for new request submission
     */
    private function sendNewRequestEmails(Request $request): void
    {
        $recipients = [];

        // Notify the request creator (confirmation)
        if ($request->user) {
            $recipients[] = [
                'email' => $request->user->email,
                'name' => $request->user->name,
                'type' => 'requester'
            ];
        }

        // Send emails
        foreach ($recipients as $recipient) {
            Mail::to($recipient['email'])
                ->send(new NewRequestSubmitted($request, $recipient));
        }

        Log::info('New request submission emails sent', [
            'request_id' => $request->id,
            'recipient_count' => count($recipients)
        ]);
    }

    /**
     * Send emails for status changes
     */
    private function sendStatusChangeEmails(Request $request, ?string $previousStatus): void
    {
        $recipients = [];

        // Always notify the request creator
        if ($request->user) {
            $recipients[] = [
                'email' => $request->user->email,
                'name' => $request->user->name,
                'type' => 'requester'
            ];
        }

        // Notify matched partner if exists
        if ($request->matchedPartner) {
            $recipients[] = [
                'email' => $request->matchedPartner->email,
                'name' => $request->matchedPartner->name,
                'type' => 'partner'
            ];
        }

        // Notify admins for certain status changes
        if ($this->shouldNotifyAdmins($request)) {
            $admins = User::where('is_admin', true)->get();
            foreach ($admins as $admin) {
                $recipients[] = [
                    'email' => $admin->email,
                    'name' => $admin->name,
                    'type' => 'admin'
                ];
            }
        }

        // Send emails
        foreach ($recipients as $recipient) {
            Mail::to($recipient['email'])
                ->send(new RequestStatusChanged($request, $recipient, $previousStatus));
        }

        Log::info('Request status change emails sent', [
            'request_id' => $request->id,
            'new_status' => $request->status->status_label,
            'previous_status' => $previousStatus,
            'recipient_count' => count($recipients)
        ]);
    }

    /**
     * Send emails for partner matching
     */
    private function sendPartnerMatchingEmails(Request $request, User $partner): void
    {
        $recipients = [];

        // Notify the request creator
        if ($request->user) {
            $recipients[] = [
                'email' => $request->user->email,
                'name' => $request->user->name,
                'type' => 'requester'
            ];
        }

        // Notify the matched partner
        $recipients[] = [
            'email' => $partner->email,
            'name' => $partner->name,
            'type' => 'partner'
        ];

        // Send emails
        foreach ($recipients as $recipient) {
            Mail::to($recipient['email'])
                ->send(new RequestMatchedWithPartner($request, $partner, $recipient));
        }

        Log::info('Request matching emails sent', [
            'request_id' => $request->id,
            'partner_id' => $partner->id,
            'recipient_count' => count($recipients)
        ]);
    }

    /**
     * Check if admins should be notified for this status change
     */
    private function shouldNotifyAdmins(Request $request): bool
    {
        $notifyAdminStatuses = [
            'submitted',
            'under_review',
            'approved',
            'rejected',
            'completed'
        ];

        return in_array($request->status->status_code ?? '', $notifyAdminStatuses);
    }

    /**
     * Handle the Request "deleting" event.
     */
    public function deleting(Request $request): void
    {
        Log::info('Request being deleted', ['request_id' => $request->id]);
    }
}
