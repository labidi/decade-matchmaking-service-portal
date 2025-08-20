<?php

namespace App\Providers;

use App\Models\Request;
use App\Models\Request\Offer;
use App\Observers\RequestObserver;
use App\Observers\RequestOfferObserver;
use App\Policies\RequestPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

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
        
        // Register the observers
        Request::observe(RequestObserver::class);
        Offer::observe(RequestOfferObserver::class);
        
        // Register policies
        Gate::policy(Request::class, RequestPolicy::class);
    }
}
