<?php

namespace App\Http\Controllers;

use App\Services\SettingsService;
use Inertia\Inertia;
use App\Models\Setting;

class IndexController extends Controller
{

    public function __construct(private readonly SettingsService $settingsService)
    {
    }

    public function __invoke()
    {
        return Inertia::render('Index', [
            'title' => 'Welcome',
            'description' => "",
            'banner' => [
                'title' => 'Connect for a Sustainable Ocean',
                'description' => "Whether you're seeking training or offering expertise, this platform makes the connection. It’s where organizations find support—and partners find purpose. By matching demand with opportunity, it brings the right people and resources together. A transparent marketplace driving collaboration, innovation, and impact.",
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
            'metrics' => config('metrics')
        ]);
    }
}
