<?php

namespace App\Http\Controllers;

use App\Services\SettingsService;
use App\Services\OpportunityService;
use App\Http\Resources\OpportunityResource;
use Inertia\Inertia;
use App\Models\Setting;

class IndexController extends Controller
{

    public function __construct(
        private readonly SettingsService $settingsService,
        private readonly OpportunityService $opportunityService
    ) {
    }

    /**
     * @throws \Throwable
     */
    public function __invoke()
    {
        $recentOpportunities = $this->opportunityService->getRecentActiveOpportunities(10);

        return Inertia::render('Index', [
            'title' => 'Welcome',
            'description' => "",
            'banner' => [
                'title' => 'Connect for a Sustainable Ocean',
                'description' => "The Ocean Decade Capacity Development Platform",
                'image' => '/assets/img/sidebar.png'
            ],
            'YoutubeEmbed' => [
                'src' => $this->settingsService->getSetting(setting::HOMEPAGE_YOUTUBE_VIDEO),
                'title' => 'Connect for a Sustainable Ocean'
            ],
            'portalGuide' => [
                'description' => 'A user guide to help you navigate the platform.',
                'url' => $this->settingsService->getSetting(setting::PORTAL_GUIDE),
            ],
            'metrics' => [
                'number_of_open_partner_opportunities' => $this->settingsService->getSetting(setting::OPEN_PARTNER_OPPORTUNITIES_METRIC) ?? 0,
                'number_successful_matches' =>  $this->settingsService->getSetting(setting::SUCCESSFUL_MATCHES_METRIC) ?? 0,
                'number_fully_closed_matches' => $this->settingsService->getSetting(setting::FULLY_CLOSED_MATCHES_METRIC) ?? 0,
                'number_user_requests_in_implementation' => $this->settingsService->getSetting(setting::REQUEST_IN_IMPLEMENTATION_METRIC) ?? 0,
                'committed_funding_amount' => $this->settingsService->getSetting(setting::COMMITTED_FUNDING_METRIC) ?? 0,
            ],
            'recentOpportunities' => $recentOpportunities->toResourceCollection(OpportunityResource::class),
        ]);
    }
}
