<?php

namespace App\Http\Controllers;

use App\Traits\HasBreadcrumbs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    use HasBreadcrumbs;
    public function index(Request $request): \Inertia\Response
    {
        $user = $request->user();
        return Inertia::render('User/Home', [
            'title' => 'Welcome ' . $user->name,
            'banner' => [
                'title' => 'Welcome back ' . $user->name,
                'description' => 'Whether you\'re seeking training or offering expertise, this platform makes the connection. It\'s where organizations find support—and partners find purpose. By matching demand with opportunity, it brings the right people and resources together. A transparent marketplace driving collaboration, innovation, and impact.',
                'image' => '/assets/img/sidebar.png',
            ],
            'breadcrumbs' => [
                ['name' => 'Home'],
            ],
        ]);
    }
}
