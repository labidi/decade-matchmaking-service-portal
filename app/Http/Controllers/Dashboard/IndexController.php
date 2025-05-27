<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class IndexController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function __invoke(Request $HttpRequest): \Inertia\Response
    {
        $user = $HttpRequest->user();
        return Inertia::render('Dashboard', [
            'title' => 'Welcome '.$user->name,
            'banner' => [
                'title' => 'Welcome back '.$user->name,
                'description' => 'Whether you\'re seeking training or offering expertise, this platform makes the connection. It’s where organizations find support—and partners find purpose. By matching demand with opportunity, it brings the right people and resources together. A transparent marketplace driving collaboration, innovation, and impact.',
                'image' => 'http://portal_dev.local/assets/img/sidebar.png',
            ]
        ]);
    }
}