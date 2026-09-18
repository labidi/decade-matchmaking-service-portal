<?php

namespace App\Providers;

use App\Channels\SystemNotificationChannel;
use App\Contracts\Auth\AuthenticationServiceInterface;
use App\Infrastructure\Email\Channels\MandrillChannel;
use App\Infrastructure\Email\Models\EmailLog;
use App\Models\Document;
use App\Models\IOCPlatform;
use App\Models\Opportunity;
use App\Models\Organization;
use App\Models\Request;
use App\Models\Request\Detail as RequestDetail;
use App\Models\Request\Offer;
use App\Models\Request\Status as RequestStatus;
use App\Models\RequestSubscription;
use App\Models\Setting;
use App\Models\SystemNotification;
use App\Models\User;
use App\Models\UserInvitation;
use App\Models\UserNotificationSetting;
use App\Observers\OpportunityObserver;
use App\Observers\RequestObserver;
use App\Observers\RequestOfferObserver;
use App\Observers\UserObserver;
use App\Policies\OfferPolicy;
use App\Policies\OpportunityPolicy;
use App\Policies\RequestPolicy;
use App\Policies\UserPolicy;
use App\Services\Actions\DocumentActionProvider;
use App\Services\Actions\OfferActionProvider;
use App\Services\Auth\AuthenticationService;
use App\Services\Auth\Strategies\OAuthAuthStrategy;
use App\Services\Auth\Strategies\OceanExpertAuthStrategy;
use App\Services\Request\RequestActionProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register simplified Action Provider Pattern services
        $this->app->singleton(RequestActionProvider::class);
        $this->app->singleton(OfferActionProvider::class);
        $this->app->singleton(DocumentActionProvider::class);

        // Register authentication services
        $this->app->singleton(
            AuthenticationServiceInterface::class,
            AuthenticationService::class
        );

        // Register authentication strategies as singletons
        $this->app->singleton(OceanExpertAuthStrategy::class);
        $this->app->singleton(OAuthAuthStrategy::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        JsonResource::withoutWrapping();

        $this->configureModelConventions();

        // Register custom notification channels
        Notification::extend('mandrill', function ($app) {
            return new MandrillChannel;
        });

        Notification::extend('system', function ($app) {
            return new SystemNotificationChannel;
        });

        // Configure rate limiters for authentication
        $this->configureRateLimiting();

        // Register the observers
        Request::observe(RequestObserver::class);
        Offer::observe(RequestOfferObserver::class);
        Opportunity::observe(OpportunityObserver::class);
        User::observe(UserObserver::class);

        // Register policies
        Gate::policy(Request::class, RequestPolicy::class);
        Gate::policy(Opportunity::class, OpportunityPolicy::class);
        Gate::policy(Offer::class, OfferPolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        // Note: Event listeners are automatically discovered in app/Listeners/
        // with proper handle() methods that type-hint events

        if (app()->environment('production') && config('services.opportunity_click.ip_pepper') === '') {
            \Log::warning('OPPORTUNITY_CLICK_IP_PEPPER is empty in production; opportunity click IP hashes are not peppered.');
        }
    }

    /**
     * Decouple persisted class names from the PHP namespace layout.
     *
     * - The morph map stores short aliases in polymorphic *_type columns
     *   (documents.parent_type, spatie model_has_roles.model_type, one_time_passwords.authenticatable_type)
     *   so models can be moved between namespaces without touching data.
     *   Every new model MUST be added here.
     * - The factory resolver maps any model, whatever its namespace, to Database\Factories\{Model}Factory.
     */
    protected function configureModelConventions(): void
    {
        Relation::enforceMorphMap(self::morphMap());

        Factory::guessFactoryNamesUsing(
            fn (string $modelName) => 'Database\\Factories\\'.class_basename($modelName).'Factory'
        );
    }

    /**
     * @return array<string, class-string<\Illuminate\Database\Eloquent\Model>>
     */
    public static function morphMap(): array
    {
        return [
            'user' => User::class,
            'user_invitation' => UserInvitation::class,
            'user_notification_setting' => UserNotificationSetting::class,
            'request' => Request::class,
            'request_detail' => RequestDetail::class,
            'request_status' => RequestStatus::class,
            'request_subscription' => RequestSubscription::class,
            'offer' => Offer::class,
            'opportunity' => Opportunity::class,
            'document' => Document::class,
            'organization' => Organization::class,
            'ioc_platform' => IOCPlatform::class,
            'setting' => Setting::class,
            'system_notification' => SystemNotification::class,
            'email_log' => EmailLog::class,
        ];
    }

    /**
     * Configure rate limiting for authentication endpoints
     */
    protected function configureRateLimiting(): void
    {
        // Authentication rate limiting: 5 attempts per minute per email
        RateLimiter::for('authentication', function (HttpRequest $request) {
            return Limit::perMinute(5)->by($request->input('email') ?? $request->ip());
        });

        // OAuth callback rate limiting: 10 attempts per minute per IP
        RateLimiter::for('oauth-callback', function (HttpRequest $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}
