<?php

namespace App\Http\Controllers\Request;

use App\Http\Resources\RequestResource;
use App\Services\Request\RequestPermissionService;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\ExportService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RequestListController extends BaseRequestController
{
    public function __construct(
        private readonly  RequestPermissionService $permissionService,
        RequestService $service
    )
    {
        parent::__construct($service);
    }

    /**
     * Display requests list - unified method for both admin and user contexts
     */
    public function list(Request $httpRequest): Response
    {
        $filters = $this->buildFilters($httpRequest);
        // Admin view - all requests
        $requests = $this->service->getPaginatedRequests($filters['search'], $filters['sort']);

        $requests->setCollection($requests->getCollection()->transform(function ($request) {
            $permissions = $this->permissionService->getPermissions($request, auth()->user());
            return RequestResource::withPermissions($request, $permissions);
        }));

        return Inertia::render($this->getViewPrefix() . 'Request/List', [
            'title' => "Requests",
            'requests' => $requests,
            'currentSort' => $filters['current']['sort'],
            'currentSearch' => $filters['current']['search'],
            'breadcrumbs' => $this->buildContextualRequestBreadcrumbs('list'),
            'availableStatuses' => $this->service->getAvailableStatuses(),
        ]);
    }

    /**
     * Display user's own requests list
     */
    public function myRequests(Request $httpRequest): Response
    {
        $filters = $this->buildFilters($httpRequest);
        $requests = $this->service->getUserRequests($httpRequest->user(), $filters['search'], $filters['sort']);

        $requests->setCollection($requests->getCollection()->transform(function ($request) {
            $permissions = $this->permissionService->getPermissions($request, auth()->user());
            return RequestResource::withPermissions($request, $permissions);
        }));

        return Inertia::render('Request/List', [
            'title' => 'My requests',
            'banner' => [
                'title' => 'List of my requests',
                'description' => 'Manage your requests here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'requests' => $requests,
            'routeName' => 'request.me.list',
            'currentSort' => $filters['current']['sort'],
            'currentSearch' => $filters['current']['search'],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'My requests', 'url' => route('request.me.list')],
            ],
        ]);
    }

    /**
     * Display public requests list (for partners)
     */
    public function publicRequests(Request $httpRequest): Response
    {
        $filters = $this->buildFilters($httpRequest);
        $requests = $this->service->getPublicRequests($filters['search'], $filters['sort']);
        $requests->setCollection($requests->getCollection()->transform(function ($request) {
            $permissions = $this->permissionService->getPermissions($request, auth()->user());
            return RequestResource::withPermissions($request, $permissions);
        }));

        return Inertia::render('Request/List', [
            'title' => 'View Request for Training workshops',
            'banner' => [
                'title' => 'View Request for Training workshops',
                'description' => 'View requests for training and workshops.',
                'image' => '/assets/img/sidebar.png',
            ],
            'routeName' => 'request.list',
            'currentSort' => $filters['current']['sort'],
            'currentSearch' => $filters['current']['search'],
            'requests' => $requests,
            'breadcrumbs' => [
                [
                    'name' => 'Home',
                    'url' => route('user.home')
                ],
                [
                    'name' => 'Requests for Training & workshops',
                    'url' => route('request.list')
                ],
            ]
        ]);
    }

    /**
     * Display matched requests for user
     */
    public function matchedRequests(Request $httpRequest): Response
    {
        $filters = $this->buildFilters($httpRequest);
        $requests = $this->service->getMatchedRequests($httpRequest->user(), $filters['search'], $filters['sort']);
        $requests->setCollection($requests->getCollection()->transform(function ($request) {
            $permissions = $this->permissionService->getPermissions($request, auth()->user());
            return RequestResource::withPermissions($request, $permissions);
        }));
        return Inertia::render('Request/List', [
            'title' => 'View my matched requests',
            'banner' => [
                'title' => 'View my matched requests',
                'description' => 'View and browse my matched Request with CDF partners',
                'image' => '/assets/img/sidebar.png',
            ],
            'routeName' => 'request.me.matched-requests',
            'currentSort' => $filters['current']['sort'],
            'currentSearch' => $filters['current']['search'],
            'requests' => $requests,
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'My matched Requests', 'url' => route('request.list')],
            ]
        ]);
    }

    /**
     * Export requests to CSV - admin only functionality
     */
    public function exportCsv(ExportService $exportService): StreamedResponse
    {
        return $exportService->exportRequestsCsv();
    }
}
