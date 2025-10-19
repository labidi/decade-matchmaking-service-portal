<?php

namespace App\Http\Controllers;

use App\Services\SettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Illuminate\Support\Facades\Route;

class HomeController extends Controller
{
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
                'description' => 'The Ocean Decade Capacity Development Platform',
                'image' => '/assets/img/sidebar.png',
            ],
        ]);
    }
}
