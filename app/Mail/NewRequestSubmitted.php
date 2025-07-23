<?php

namespace App\Mail;

use App\Models\Request;
use App\Models\RequestEnhancer;
use App\Services\EmailTemplateService;
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
        $templateService = app(EmailTemplateService::class);
        $rendered = $templateService->renderTemplate(
            EmailTemplateService::TYPE_REQUEST_SUBMITTED,
            $this->getTemplateData()
        );

        return new Envelope(
            subject: $rendered['subject'],
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
                'enhancedData' => RequestEnhancer::enhanceRequest($this->request)
            ]
        );
    }

    /**
     * Get template data for variable replacement
     */
    private function getTemplateData(): array
    {
        return [
            'recipient_name' => $this->recipient['name'],
            'request_title' => $this->request->title,
            'request_id' => $this->request->id,
            'requester_name' => $this->request->requester_name,
            'app_name' => config('app.name'),
            'app_url' => config('app.url')
        ];
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
