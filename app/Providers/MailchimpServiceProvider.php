<?php

declare(strict_types=1);

namespace App\Providers;

use App\Mail\Transport\MailchimpTransport;
use App\Services\Mail\MailchimpService;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Mail\MailManager;
use Illuminate\Support\ServiceProvider;
use Psr\Log\LoggerInterface;

class MailchimpServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(MailchimpService::class, function (Application $app): MailchimpService {
            $config = config('mailchimp.transactional');
            $apiKey = $config['api_key'];

            if (empty($apiKey)) {
                throw new \InvalidArgumentException('Mailchimp Transactional API key is required');
            }

            return new MailchimpService(
                apiKey: $apiKey,
                config: $config,
                logger: $app->make(LoggerInterface::class)
            );
        });
    }

    public function boot(): void
    {
        $this->app->afterResolving(MailManager::class, function (MailManager $mailManager): void {
            $mailManager->extend('mailchimp', function (array $config): MailchimpTransport {
                $mailchimpService = $this->app->make(MailchimpService::class);
                
                return new MailchimpTransport($mailchimpService);
            });
        });
    }
}