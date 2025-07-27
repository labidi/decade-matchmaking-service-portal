<?php

namespace App\Mail;

use App\Models\Request;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RequestMatchedWithPartner extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Request $request;
    public User $partner;
    public array $recipient;

    /**
     * Create a new message instance.
     */
    public function __construct(Request $request, User $partner, array $recipient)
    {
        $this->request = $request;
        $this->partner = $partner;
        $this->recipient = $recipient;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = "Partnership Confirmed - {$this->request->capacity_development_title}";

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
            view: 'emails.request-matched-with-partner',
            with: [
                'request' => $this->request,
                'partner' => $this->partner,
                'recipient' => $this->recipient,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}