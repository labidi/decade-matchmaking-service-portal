<?php

declare(strict_types=1);

namespace App\Providers;

use App\Console\Commands\Email\ListEmailTemplatesCommand;
use App\Console\Commands\Email\TestEmailCommand;
use App\Console\Commands\Email\ValidateEmailTemplatesCommand;
use App\Console\Commands\Email\EmailHealthCheckCommand;
use App\Services\Email\EmailLogger;
use App\Services\Email\EmailTemplateService;
use App\Services\Email\HealthCheckService;
use App\Services\Email\MandrillClient;
use App\Services\Email\RateLimiter;
use App\Services\Email\TemplateResolver;
use App\Services\Email\VariableValidator;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;
use MailchimpTransactional\ApiClient;

class EmailServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register Mandrill API client as singleton
        $this->app->singleton(ApiClient::class, function (Application $app) {
            $apiKey = config('mail-templates.mandrill.api_key');

            if (empty($apiKey)) {
                throw new \RuntimeException('Mandrill API key not configured. Please set MANDRILL_API_KEY in your .env file.');
            }

            $client = new ApiClient();
            $client->setApiKey($apiKey);

            return $client;
        });

        // Register email services as singletons for performance
        $this->app->singleton(TemplateResolver::class);
        $this->app->singleton(VariableValidator::class);
        $this->app->singleton(EmailLogger::class);
        $this->app->singleton(MandrillClient::class);
        $this->app->singleton(EmailTemplateService::class);
        $this->app->singleton(RateLimiter::class);
        $this->app->singleton(HealthCheckService::class);

        // Register commands
        $this->commands([
            ValidateEmailTemplatesCommand::class,
            ListEmailTemplatesCommand::class,
            TestEmailCommand::class,
            EmailHealthCheckCommand::class,
        ]);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Publish configuration
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../../config/mail-templates.php' => config_path('mail-templates.php'),
            ], 'mail-templates');

            // Load migrations
            $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');
        }

        // Register event listeners
        $this->registerEventListeners();
    }

    /**
     * Register event listeners for email events.
     */
    protected function registerEventListeners(): void
    {
        $events = $this->app['events'];

        // Email sent event
        $events->listen(
            \App\Events\Email\EmailSent::class,
            \App\Listeners\Email\LogEmailSent::class
        );

        // Email failed event
        $events->listen(
            \App\Events\Email\EmailFailed::class,
            \App\Listeners\Email\NotifyAdminOfEmailFailure::class
        );

        // Email delivered event (from webhook)
        $events->listen(
            \App\Events\Email\EmailDelivered::class,
            \App\Listeners\Email\UpdateEmailDeliveryStatus::class
        );

        // Email bounced event (from webhook)
        $events->listen(
            \App\Events\Email\EmailBounced::class,
            \App\Listeners\Email\HandleBouncedEmail::class
        );
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array<string>
     */
    public function provides(): array
    {
        return [
            ApiClient::class,
            TemplateResolver::class,
            VariableValidator::class,
            EmailLogger::class,
            MandrillClient::class,
            EmailTemplateService::class,
            RateLimiter::class,
            HealthCheckService::class,
        ];
    }
}