<?php

namespace App\Mail;

use App\Models\Opportunity;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OpportunityPublished extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public readonly Opportunity $opportunity,
        public readonly string $recipientType = 'creator'
    ) {
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match($this->recipientType) {
            'creator' => 'Your Opportunity Has Been Published',
            'admin' => 'New Opportunity Published: ' . $this->opportunity->title,
            default => 'New Opportunity Available'
        };

        return new Envelope(subject: $subject);
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.opportunity.published',
            with: [
                'opportunity' => $this->opportunity,
                'recipientType' => $this->recipientType,
                'viewUrl' => route('opportunities.show', $this->opportunity->id),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}