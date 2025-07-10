<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ExportService;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Models\User;

class OcdRequestController extends Controller
{
    public function __construct(private RequestService $service)
    {
    }

    public function list(Request $httpRequest)
    {
        $requests = $this->service->getAllRequests();
        $partners = User::role('partner')->select('id', 'name', 'email', 'first_name', 'last_name')->get()->map(function ($partner) {
            return [
                'id' => $partner->id,
                'name' => $partner->name,
                'email' => $partner->email,
                'first_name' => $partner->first_name,
                'last_name' => $partner->last_name,
                'value' => $partner->id,
                'label' => ($partner->name ?: trim(($partner->first_name ?? '') . ' ' . ($partner->last_name ?? ''))) . ' (' . $partner->email . ')',
            ];
        })->values();
        return Inertia::render('Admin/Request/List', [
            'title' => 'My requests',
            'requests' => $requests,
            'partners' => $partners,
        ]);
    }

    public function exportCsv(ExportService $exportService): StreamedResponse
    {
        return $exportService->exportRequestsCsv();
    }
}
