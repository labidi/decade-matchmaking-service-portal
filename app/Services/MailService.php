<?php

namespace App\Services;

use App\Models\Request;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\RequestStatusChanged;
use App\Mail\NewRequestSubmitted;
use App\Mail\RequestMatchedWithPartner;

class MailService
{
    /**
     * Send email when request status changes
     */
    public function sendRequestStatusChanged(Request $request, string $previousStatus = null): void
    {
        try {
            $recipients = $this->getStatusChangeRecipients($request);

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

        } catch (\Exception $e) {
            Log::error('Failed to send request status change emails', [
                'request_id' => $request->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send email when new request is submitted
     */
    public function sendNewRequestSubmitted(Request $request): void
    {
        try {
            $recipients = $this->getNewRequestRecipients($request);

            foreach ($recipients as $recipient) {
                Mail::to($recipient['email'])
                    ->send(new NewRequestSubmitted($request, $recipient));
            }

            Log::info('New request submission emails sent', [
                'request_id' => $request->id,
                'recipient_count' => count($recipients)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send new request submission emails', [
                'request_id' => $request->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send email when request is matched with partner
     */
    public function sendRequestMatchedWithPartner(Request $request, User $partner): void
    {
        try {
            $recipients = $this->getMatchingRecipients($request, $partner);

            foreach ($recipients as $recipient) {
                Mail::to($recipient['email'])
                    ->send(new RequestMatchedWithPartner($request, $partner, $recipient));
            }

            Log::info('Request matching emails sent', [
                'request_id' => $request->id,
                'partner_id' => $partner->id,
                'recipient_count' => count($recipients)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send request matching emails', [
                'request_id' => $request->id,
                'partner_id' => $partner->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get recipients for status change notifications
     */
    private function getStatusChangeRecipients(Request $request): array
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

        return $recipients;
    }

    /**
     * Get recipients for new request notifications
     */
    private function getNewRequestRecipients(Request $request): array
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

        // Notify admins about new requests
       /* $admins = User::where('is_admin', true)->get();
        foreach ($admins as $admin) {
            $recipients[] = [
                'email' => $admin->email,
                'name' => $admin->name,
                'type' => 'admin'
            ];
        }*/
        return $recipients;
    }

    /**
     * Get recipients for matching notifications
     */
    private function getMatchingRecipients(Request $request, User $partner): array
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

        return $recipients;
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

}
