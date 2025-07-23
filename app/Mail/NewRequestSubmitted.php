<?php

namespace App\Mail;

use App\Models\Request;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewRequestSubmitted extends Mailable
{
    use SerializesModels;

    public Request $request;
    public array $recipient;

    /**
     * Create a new message instance.
     */
    public function __construct(Request $request, array $recipient)
    {
        $this->request = $request;
        $this->recipient = $recipient;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->recipient['type'] === 'requester'
            ? "Request Submitted - {$this->request->capacity_development_title}"
            : "New Request Submitted - {$this->request->capacity_development_title}";

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
            view: 'emails.new-request-submitted',
            with: [
                'request' => $this->request,
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
