<?php

namespace App\Http\Controllers\Request;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\ExportService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RequestListController extends BaseRequestController
{
    /**
     * Display requests list - unified method for both admin and user contexts
     */
    public function list(Request $httpRequest): Response
    {
        $filters = $this->buildFilters($httpRequest);

        if ($this->isAdminRoute()) {
            // Admin view - all requests
            $requests = $this->service->getPaginatedRequests($filters['search'], $filters['sort']);
            $this->applyPaginationParams($requests, $httpRequest);

            $viewData = $this->getListViewData('Requests', $requests, $filters);

            return Inertia::render($this->getViewPrefix() . 'Request/List', $viewData);
        }

        // User view - their own requests
        $requests = $this->service->getUserRequests($httpRequest->user(), $filters['search'], $filters['sort']);
        $this->applyPaginationParams($requests, $httpRequest);

        $viewData = $this->getListViewData('My requests', $requests, $filters, [
            'banner' => [
                'title' => 'List of my requests',
                'description' => 'Manage your requests here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'routeName' => 'request.me.list',
        ]);

        return Inertia::render('Request/List', $viewData);
    }

    /**
     * Display user's own requests list
     */
    public function myRequests(Request $httpRequest): Response
    {
        $filters = $this->buildFilters($httpRequest);
        $requests = $this->service->getUserRequests($httpRequest->user(), $filters['search'], $filters['sort']);
        $this->applyPaginationParams($requests, $httpRequest);

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
            ],
            'grid.actions' => [
                'canEdit' => false,
                'canDelete' => false,
                'canView' => true,
                'canCreate' => false,
                'canExpressInterest' => true,
                'canPreview' => true,
            ],
        ]);
    }

    /**
     * Display matched requests for user
     */
    public function matchedRequests(Request $httpRequest): Response
    {
        $filters = $this->buildFilters($httpRequest);
        $requests = $this->service->getMatchedRequests($httpRequest->user(), $filters['search'], $filters['sort']);

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
            ],
            'grid.actions' => [
                'canEdit' => false,
                'canDelete' => false,
                'canView' => true,
                'canCreate' => false,
                'canExpressInterest' => false,
            ],
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
