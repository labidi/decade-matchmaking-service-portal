<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OcdRequestController extends Controller
{
    public function __construct(private RequestService $service)
    {
    }

    public function list(Request $httpRequest)
    {
        $requests = $this->service->getAllRequests();
        return Inertia::render('Admin/Request/List', [
            'title' => 'My requests',
            'requests' => $requests,
        ]);
    }
}
