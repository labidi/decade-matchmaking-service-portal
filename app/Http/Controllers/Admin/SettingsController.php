<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Traits\HasBreadcrumbs;
use Inertia\Inertia;

class SettingsController extends Controller
{
    use HasBreadcrumbs;
    public function index()
    {
        return Inertia::render('Admin/Portal/Settings', [
            'title' => 'Portal Settings',
            'breadcrumbs' => $this->buildAdminSectionBreadcrumbs('settings'),
        ]);
    }
}
