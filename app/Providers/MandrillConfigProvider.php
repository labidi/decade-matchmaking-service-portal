<?php

declare(strict_types=1);

namespace App\Providers;

use App\Services\SettingsService;
use Illuminate\Support\ServiceProvider;

/**
 * Service Provider to configure Mandrill API key from database with ENV fallback
 *
 * This provider ensures the Mandrill API key is loaded from the database settings
 * if available, falling back to the environment configuration if not found.
 */
class MandrillConfigProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Nothing to register
    }

    /**
     * Bootstrap services.
     *
     * This runs after the database is available, allowing us to fetch settings
     * and override the config value before it's used anywhere in the app.
     */
    public function boot(): void
    {
        $this->configureMandrillApiKey();
    }

    /**
     * Configure Mandrill API key with database priority and ENV fallback
     */
    private function configureMandrillApiKey(): void
    {
        try {
            // Skip if running in console during migrations
            // This prevents errors when the settings table doesn't exist yet
            if ($this->app->runningInConsole() && !$this->app->environment('testing')) {
                $command = $_SERVER['argv'][1] ?? '';
                if (str_contains($command, 'migrate')) {
                    return;
                }
            }

            /** @var SettingsService $settingsService */
            $settingsService = $this->app->make(SettingsService::class);

            // Get API key from database, null if not found
            $dbApiKey = $settingsService->getSetting('mandrill_api_key');

            // Only override if we have a non-empty value from database
            if (!empty($dbApiKey)) {
                config(['mail-templates.mandrill.api_key' => $dbApiKey]);

                // Log the source for debugging (optional)
                if (config('app.debug')) {
                    \Log::debug('Mandrill API key loaded from database settings');
                }
            } else {
                // Log fallback to ENV (optional)
                if (config('app.debug') && config('mail-templates.mandrill.api_key')) {
                    \Log::debug('Mandrill API key using ENV configuration (database setting not found)');
                }
            }
        } catch (\Exception $e) {
            // If database is not available (during migrations, fresh installs, etc.),
            // silently fall back to ENV configuration
            if (config('app.debug')) {
                \Log::warning('Could not load Mandrill API key from database: ' . $e->getMessage());
            }
        }
    }
}