<?php

namespace App\Observers;

use App\Models\Request\Offer;
use App\Models\User;
use App\Mail\OfferAcceptedNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class RequestOfferObserver
{
    /**
     * Handle the Offer "created" event.
     */
    public function created(Offer $offer): void
    {
        //
    }

    /**
     * Handle the Offer "updated" event.
     */
    public function updated(Offer $offer): void
    {
        // Check if is_accepted changed from false to true
        if ($offer->isDirty('is_accepted') && $offer->is_accepted && !$offer->getOriginal('is_accepted')) {
            $this->handleOfferAcceptance($offer);
        }
    }

    /**
     * Handle the Offer "deleted" event.
     */
    public function deleted(Offer $offer): void
    {
        Log::info('Offer being deleted', ['offer_id' => $offer->id]);
    }

    /**
     * Handle the Offer "restored" event.
     */
    public function restored(Offer $offer): void
    {
        //
    }

    /**
     * Handle the Offer "force deleted" event.
     */
    public function forceDeleted(Offer $offer): void
    {
        //
    }

    /**
     * Handle offer acceptance event
     */
    private function handleOfferAcceptance(Offer $offer): void
    {
        try {
            $this->sendOfferAcceptedEmails($offer);
            Log::info('Offer accepted notification emails sent', ['offer_id' => $offer->id]);
        } catch (\Exception $e) {
            Log::error('Failed to send offer accepted emails in observer', [
                'offer_id' => $offer->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send emails for offer acceptance
     */
    private function sendOfferAcceptedEmails(Offer $offer): void
    {
        $recipients = [];
        $acceptedBy = $offer->request->user;

        // Notify administrators
        $admins = User::where('administrator', true)->get();
        foreach ($admins as $admin) {
            $recipients[] = [
                'email' => $admin->email,
                'name' => $admin->name,
                'type' => 'admin'
            ];
        }

        // Notify the partner who made the offer
        if ($offer->matchedPartner) {
            $recipients[] = [
                'email' => $offer->matchedPartner->email,
                'name' => $offer->matchedPartner->name,
                'type' => 'partner'
            ];
        }

        // Notify the request owner (confirmation)
        if ($acceptedBy) {
            $recipients[] = [
                'email' => $acceptedBy->email,
                'name' => $acceptedBy->name,
                'type' => 'requester'
            ];
        }

        // Send emails
        foreach ($recipients as $recipient) {
            Mail::to($recipient['email'])
                ->send(new OfferAcceptedNotification($offer, $acceptedBy, $recipient));
        }

        Log::info('Offer acceptance emails sent', [
            'offer_id' => $offer->id,
            'request_id' => $offer->request_id,
            'recipient_count' => count($recipients)
        ]);
    }
}
