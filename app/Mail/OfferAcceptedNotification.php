<?php

namespace App\Mail;

use App\Models\Request\Offer;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OfferAcceptedNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Offer $offer;
    public User $acceptedBy;
    public array $recipient;

    /**
     * Create a new message instance.
     */
    public function __construct(Offer $offer, User $acceptedBy, array $recipient)
    {
        $this->offer = $offer;
        $this->acceptedBy = $acceptedBy;
        $this->recipient = $recipient;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $requestTitle = $this->offer->request->capacity_development_title ?? "Request #{$this->offer->request->id}";

        $subject = match($this->recipient['type']) {
            'admin' => "Offer Accepted - {$requestTitle}",
            'partner' => "Your Offer Has Been Accepted - {$requestTitle}",
            'requester' => "Offer Acceptance Confirmation - {$requestTitle}",
            default => "Offer Accepted - {$requestTitle}"
        };

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.offer-accepted-notification',
            with: [
                'offer' => $this->offer,
                'acceptedBy' => $this->acceptedBy,
                'recipient' => $this->recipient,
                'request' => $this->offer->request,
                'partner' => $this->offer->matchedPartner,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
