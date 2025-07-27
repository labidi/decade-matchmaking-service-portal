<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Request as OCDRequest;
use App\Services\RequestService;
use App\Traits\HasBreadcrumbs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\ExportService;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Models\User;

class OcdRequestController extends Controller
{
    use HasBreadcrumbs;

    public function __construct(private RequestService $service)
    {
    }

    public function list(Request $httpRequest)
    {
        // Extract and validate parameters
        $sortField = $httpRequest->get('sort', 'created_at');
        $sortOrder = $httpRequest->get('order', 'desc');
        $searchUser = $httpRequest->get('user');
        $searchTitle = $httpRequest->get('title');


        // Prepare filters for service
        $searchFilters = array_filter([
            'user' => $searchUser,
            'title' => $searchTitle,
        ]);

        $sortFilters = [
            'field' => $sortField,
            'order' => $sortOrder,
            'per_page' => 10,
        ];

        // Get paginated requests from service
        $requests = $this->service->getPaginatedRequests($searchFilters, $sortFilters);

        // Append query parameters to pagination links
        $requests->appends($httpRequest->only(['sort', 'order', 'user', 'title']));

        return Inertia::render('Admin/Request/List', [
            'title' => 'Requests',
            'requests' => $requests,
            'currentSort' => [
                'field' => $sortField,
                'order' => $sortOrder,
            ],
            'currentSearch' => [
                'user' => $searchUser ?? '',
                'title' => $searchTitle ?? '',
            ],
            'breadcrumbs' => $this->buildRequestBreadcrumbs('list', null, true),
        ]);
    }

    public function show($requestId)
    {
        $request = OCDRequest::with(['status', 'detail', 'user', 'offers'])
            ->findOrFail($requestId);

        return Inertia::render('Admin/Request/Show', [
            'title' => 'Request Details',
            'request' => $request,
            'breadcrumbs' => $this->buildRequestBreadcrumbs('show', $requestId, true),
        ]);
    }

    public function exportCsv(ExportService $exportService): StreamedResponse
    {
        return $exportService->exportRequestsCsv();
    }
}
