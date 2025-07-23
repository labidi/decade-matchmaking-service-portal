<?php

namespace App\Mail;

use App\Models\Request;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RequestStatusChanged extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Request $request;
    public array $recipient;
    public ?string $previousStatus;

    /**
     * Create a new message instance.
     */
    public function __construct(Request $request, array $recipient, ?string $previousStatus = null)
    {
        $this->request = $request;
        $this->recipient = $recipient;
        $this->previousStatus = $previousStatus;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = "Request Status Update - {$this->request->capacity_development_title}";

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
            view: 'emails.request-status-changed',
            with: [
                'request' => $this->request,
                'recipient' => $this->recipient,
                'previousStatus' => $this->previousStatus,
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