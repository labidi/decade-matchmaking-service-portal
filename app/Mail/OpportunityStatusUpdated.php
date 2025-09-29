<?php

namespace App\Mail;

use App\Enums\Opportunity\Status;
use App\Models\Opportunity;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OpportunityStatusUpdated extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public readonly Opportunity $opportunity,
        public readonly ?Status $previousStatus,
        public readonly Status $newStatus,
        public readonly string $recipientType = 'creator'
    ) {
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $action = match($this->newStatus) {
            Status::ACTIVE => 'Approved',
            Status::REJECTED => 'Rejected',
            Status::CLOSED => 'Closed',
            default => 'Updated'
        };

        return new Envelope(
            subject: sprintf('Opportunity %s: %s', $action, $this->opportunity->title)
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.opportunity.status-updated',
            with: [
                'opportunity' => $this->opportunity,
                'previousStatus' => $this->previousStatus?->label() ?? 'N/A',
                'newStatus' => $this->newStatus->label(),
                'recipientType' => $this->recipientType,
                'viewUrl' => route('opportunity.show', $this->opportunity->id),
                'actionRequired' => $this->determineActionRequired(),
            ]
        );
    }

    /**
     * Determine if any action is required from the recipient.
     */
    private function determineActionRequired(): ?string
    {
        if ($this->recipientType === 'creator') {
            return match($this->newStatus) {
                Status::REJECTED => 'Please review the feedback and consider resubmitting.',
                Status::ACTIVE => 'Your opportunity is now live and visible to all users.',
                default => null
            };
        }

        return null;
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