<?php

namespace App\Http\Controllers;

use App\Services\SettingsService;
use App\Traits\HasBreadcrumbs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Illuminate\Support\Facades\Route;

class HomeController extends Controller
{

    use HasBreadcrumbs;

    public function __construct(private readonly SettingsService $settingsService)
    {
    }

    public function index(
        Request $request
    ): \Inertia\Response {
        $user = $request->user();
        return Inertia::render('Home', [
            'title' => 'Welcome ' . $user->name,
            'userGuide' => $this->settingsService->getSetting(Setting::USER_GUIDE),
            'partnerGuide' => $this->settingsService->getSetting(Setting::PARTNER_GUIDE),
            'banner' => [
                'title' => 'Welcome back ' . $user->name,
                'description' => 'Whether you\'re seeking training or offering expertise, this platform makes the connection. It\'s where organizations find support—and partners find purpose. By matching demand with opportunity, it brings the right people and resources together. A transparent marketplace driving collaboration, innovation, and impact.',
                'image' => '/assets/img/sidebar.png',
            ],
        ]);
    }
}
