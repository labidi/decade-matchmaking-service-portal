<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Mail\MailchimpService;
use Illuminate\Console\Command;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class MailchimpTestCommand extends Command
{
    protected $signature = 'mailchimp:test {--email= : Email address to send test message to}';

    protected $description = 'Test Mailchimp Transactional connection and send a test email';

    public function handle(MailchimpService $mailchimpService): int
    {
        $this->info('Testing Mailchimp Transactional connection...');

        // Test API connection
        if (!$mailchimpService->ping()) {
            $this->error('Failed to connect to Mailchimp Transactional API');
            return self::FAILURE;
        }

        $this->info('✓ Successfully connected to Mailchimp Transactional API');

        // Send test email if email option is provided
        $email = $this->option('email');
        if ($email) {
            $this->info("Sending test email to {$email}...");

            try {
                Mail::mailer('mailchimp')->send([], [], function (Message $message) use ($email): void {
                    $message->to($email)
                        ->subject('Mailchimp Integration Test')
                        ->html('<h1>Test Email</h1><p>This is a test email sent via Mailchimp Transactional API.</p>')
                        ->text('Test Email - This is a test email sent via Mailchimp Transactional API.');
                });

                $this->info('✓ Test email sent successfully');
            } catch (\Exception $e) {
                $this->error('Failed to send test email: ' . $e->getMessage());
                return self::FAILURE;
            }
        } else {
            $this->comment('To send a test email, use: php artisan mailchimp:test --email=your@email.com');
        }

        $this->info('Mailchimp Transactional integration is working correctly!');
        return self::SUCCESS;
    }
}