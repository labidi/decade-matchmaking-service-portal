<?php

namespace App\Http\Controllers\Request;

use App\Http\Resources\RequestResource;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\ExportService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RequestListController extends BaseRequestController
{
    public function __construct(
        private readonly RequestService $service
    ) {
    }

    /**
     * Display requests list - unified method for both admin and user contexts
     * @throws \Throwable
     */
    public function list(Request $httpRequest): Response
    {
        $filters = $this->buildFilters($httpRequest);
        $requests = $this->service->getPaginatedRequests($filters['search'], $filters['sort']);
        $requests->toResourceCollection(RequestResource::class) ;

        return Inertia::render($this->getViewPrefix() . 'Request/List', [
            'title' => "Requests",
            'requests' => $requests,
            'currentSort' => $filters['current']['sort'],
            'currentSearch' => $filters['current']['search'],
            'availableStatuses' => $this->service->getAvailableStatuses(),
        ]);
    }

    /**
     * Display user's own requests list
     * @throws \Throwable
     */
    public function myRequests(Request $httpRequest): Response
    {
        $filters = $this->buildFilters($httpRequest);
        $requests = $this->service->getUserRequests($httpRequest->user(), $filters['search'], $filters['sort']);
        $requests->toResourceCollection(RequestResource::class) ;

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
        ]);
    }

    /**
     * Display public requests list (for partners)
     * @throws \Throwable
     */
    public function publicRequests(Request $httpRequest): Response
    {
        $filters = $this->buildFilters($httpRequest);
        $requests = $this->service->getPublicRequests($filters['search'], $filters['sort']);
        $requests->toResourceCollection(RequestResource::class) ;

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
        ]);
    }

    /**
     * Display matched requests for user
     * @throws \Throwable
     */
    public function matchedRequests(Request $httpRequest): Response
    {
        $filters = $this->buildFilters($httpRequest);
        $requests = $this->service->getMatchedRequests($httpRequest->user(), $filters['search'], $filters['sort']);
        $requests->toResourceCollection(RequestResource::class) ;
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
        ]);
    }

    /**
     * Export requests to CSV - admin only functionality
     */
    public function exportCsv(ExportService $exportService): StreamedResponse
    {
        return $exportService->exportRequestsCsv();
    }


    private function buildFilters(Request $request): array
    {
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $searchUser = $request->get('user');
        $searchTitle = $request->get('title');

        return [
            'search' => array_filter([
                'user' => $searchUser,
                'title' => $searchTitle,
            ]),
            'sort' => [
                'field' => $sortField,
                'order' => $sortOrder,
                'per_page' => 2,
            ],
            'current' => [
                'sort' => ['field' => $sortField, 'order' => $sortOrder],
                'search' => ['user' => $searchUser ?? '', 'title' => $searchTitle ?? ''],
            ]
        ];
    }
}
