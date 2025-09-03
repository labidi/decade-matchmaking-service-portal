<?php

declare(strict_types=1);

namespace App\Services\Mail;

use Exception;
use MailchimpTransactional\ApiClient;
use MailchimpTransactional\Configuration;
use Psr\Log\LoggerInterface;

class MailchimpService
{
    private ApiClient $client;

    public function __construct(
        private readonly string $apiKey,
        private readonly array $config,
        private readonly LoggerInterface $logger
    ) {
        $this->initializeClient();
    }

    private function initializeClient(): void
    {
        $configuration = Configuration::getDefaultConfiguration()->setApiKey('key', $this->apiKey);
        $this->client = new ApiClient($configuration);
    }

    public function send(array $message): array
    {
        try {
            $response = $this->client->messages->send(['message' => $message]);
            
            $this->logger->info('Mailchimp email sent successfully', [
                'message_id' => $response[0]['_id'] ?? 'unknown',
                'status' => $response[0]['status'] ?? 'unknown',
                'to' => $message['to'][0]['email'] ?? 'unknown',
            ]);
            
            return $response;
        } catch (Exception $e) {
            $this->logger->error('Failed to send email via Mailchimp', [
                'error' => $e->getMessage(),
                'to' => $message['to'][0]['email'] ?? 'unknown',
            ]);
            
            throw $e;
        }
    }

    public function convertSymfonyMessage(array $symfonyMessage): array
    {
        $message = [
            'html' => $symfonyMessage['html'] ?? null,
            'text' => $symfonyMessage['text'] ?? null,
            'subject' => $symfonyMessage['subject'] ?? '',
            'from_email' => $this->config['from']['email'] ?? config('mail.from.address'),
            'from_name' => $this->config['from']['name'] ?? config('mail.from.name'),
            'to' => [],
            'track_opens' => $this->config['tracking']['opens'] ?? true,
            'track_clicks' => $this->config['tracking']['clicks'] ?? true,
            'auto_text' => $this->config['options']['auto_text'] ?? true,
            'preserve_recipients' => $this->config['options']['preserve_recipients'] ?? false,
        ];

        // Add recipients
        if (isset($symfonyMessage['to'])) {
            foreach ($symfonyMessage['to'] as $email => $name) {
                $message['to'][] = [
                    'email' => is_string($email) ? $email : $name,
                    'name' => is_string($email) ? $name : null,
                ];
            }
        }

        // Override from if specified in message
        if (isset($symfonyMessage['from'])) {
            $fromEmail = array_keys($symfonyMessage['from'])[0] ?? null;
            $fromName = array_values($symfonyMessage['from'])[0] ?? null;
            
            if ($fromEmail) {
                $message['from_email'] = $fromEmail;
                $message['from_name'] = $fromName;
            }
        }

        // Add CC recipients
        if (isset($symfonyMessage['cc'])) {
            foreach ($symfonyMessage['cc'] as $email => $name) {
                $message['to'][] = [
                    'email' => is_string($email) ? $email : $name,
                    'name' => is_string($email) ? $name : null,
                    'type' => 'cc',
                ];
            }
        }

        // Add BCC recipients
        if (isset($symfonyMessage['bcc'])) {
            foreach ($symfonyMessage['bcc'] as $email => $name) {
                $message['to'][] = [
                    'email' => is_string($email) ? $email : $name,
                    'name' => is_string($email) ? $name : null,
                    'type' => 'bcc',
                ];
            }
        }

        return $message;
    }

    public function ping(): bool
    {
        try {
            $response = $this->client->users->ping();
            return $response['PING'] === 'PONG!';
        } catch (Exception $e) {
            $this->logger->error('Mailchimp ping failed', ['error' => $e->getMessage()]);
            return false;
        }
    }
}