<?php

declare(strict_types=1);

namespace App\Mail\Transport;

use App\Services\Mail\MailchimpService;
use Exception;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\MessageConverter;

class MailchimpTransport extends AbstractTransport
{
    public function __construct(
        private readonly MailchimpService $mailchimpService
    ) {
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());
        
        $mailchimpMessage = [
            'html' => $email->getHtmlBody(),
            'text' => $email->getTextBody(),
            'subject' => $email->getSubject(),
            'to' => [],
            'cc' => [],
            'bcc' => [],
            'from' => [],
        ];

        // Add To recipients
        foreach ($email->getTo() as $address) {
            $mailchimpMessage['to'][$address->getAddress()] = $address->getName();
        }

        // Add CC recipients
        foreach ($email->getCc() as $address) {
            $mailchimpMessage['cc'][$address->getAddress()] = $address->getName();
        }

        // Add BCC recipients
        foreach ($email->getBcc() as $address) {
            $mailchimpMessage['bcc'][$address->getAddress()] = $address->getName();
        }

        // Add From address
        foreach ($email->getFrom() as $address) {
            $mailchimpMessage['from'][$address->getAddress()] = $address->getName();
        }

        // Convert to Mailchimp format
        $convertedMessage = $this->mailchimpService->convertSymfonyMessage($mailchimpMessage);
        
        // Send the message
        try {
            $response = $this->mailchimpService->send($convertedMessage);
            
            // Check for rejection or failure
            if (!empty($response) && isset($response[0]['status'])) {
                $status = $response[0]['status'];
                if (in_array($status, ['rejected', 'invalid'])) {
                    throw new Exception("Email was {$status}: " . ($response[0]['reject_reason'] ?? 'Unknown reason'));
                }
            }
        } catch (Exception $e) {
            throw new Exception('Failed to send email via Mailchimp: ' . $e->getMessage(), 0, $e);
        }
    }

    public function __toString(): string
    {
        return 'mailchimp';
    }
}