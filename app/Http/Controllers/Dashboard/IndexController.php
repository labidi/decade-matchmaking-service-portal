<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

class IndexController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function __invoke()
    {
        return Inertia('Dashboard/Index', [
            'title' => 'Dashboard',
            'description' => 'Welcome to your dashboard.',
        ]);
    }
}