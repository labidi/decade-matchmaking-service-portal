<?php

namespace App\Providers;

use App\Contracts\Auth\AuthenticationServiceInterface;
use App\Models\Opportunity;
use App\Models\Request;
use App\Models\Request\Offer;
use App\Models\User;
use App\Observers\OpportunityObserver;
use App\Observers\RequestObserver;
use App\Observers\RequestOfferObserver;
use App\Observers\UserObserver;
use App\Policies\OfferPolicy;
use App\Policies\OpportunityPolicy;
use App\Policies\RequestPolicy;
use App\Services\Actions\DocumentActionProvider;
use App\Services\Actions\OfferActionProvider;
use App\Services\Auth\AuthenticationService;
use App\Channels\MandrillChannel;
use App\Services\Auth\Strategies\OAuthAuthStrategy;
use App\Services\Auth\Strategies\OceanExpertAuthStrategy;
use App\Services\Request\RequestActionProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Notification;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
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

        // Register custom notification channels
        Notification::extend('mandrill', function ($app) {
            return new MandrillChannel();
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
        // Note: Event listeners are automatically discovered in app/Listeners/
        // with proper handle() methods that type-hint events
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
