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

class ExpressInterest extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Request $request;
    public User $interestedUser;
    public array $recipient;

    /**
     * Create a new message instance.
     */
    public function __construct(Request $request, User $interestedUser, array $recipient)
    {
        $this->request = $request;
        $this->interestedUser = $interestedUser;
        $this->recipient = $recipient;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = "Interest Expressed - {$this->request->capacity_development_title}";
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
            view: 'emails.express-interest',
            with: [
                'request' => $this->request,
                'interestedUser' => $this->interestedUser,
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
