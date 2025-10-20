<?php

namespace App\Providers;

use App\Listeners\Opportunity\NotifyAdminAboutOpportunityActivity;
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
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Resources\Json\JsonResource;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        JsonResource::withoutWrapping();

        // Register the observers
        Request::observe(RequestObserver::class);
        Offer::observe(RequestOfferObserver::class);
        Opportunity::observe(OpportunityObserver::class);
        User::observe(UserObserver::class);

        // Register policies
        Gate::policy(Request::class, RequestPolicy::class);
        Gate::policy(Opportunity::class, OpportunityPolicy::class);
        Gate::policy(Offer::class, OfferPolicy::class);

        // Register event subscribers
        Event::subscribe(NotifyAdminAboutOpportunityActivity::class);

        // Note: Event listeners are automatically discovered in app/Listeners/
        // with proper handle() methods that type-hint events
    }

}
