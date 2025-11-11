<?php

namespace App\Http\Controllers\Request;

use App\Http\Controllers\Traits\HasPageActions;
use App\Http\Resources\PublicRequestResource;
use App\Http\Resources\RequestResource;
use App\Services\ExportService;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ListController extends BaseRequestController
{
    use HasPageActions;

    public function __construct(
        private readonly RequestService $service
    ) {}

    /**
     * Get context-specific configuration
     */
    private function getContextConfiguration(string $context): array
    {
        return match ($context) {
            'admin' => [
                'component' => $this->getViewPrefix().'request/List',
                'title' => 'Requests',
                'searchFields' => [
                    ['name' => 'user', 'label' => 'User', 'type' => 'text'],
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                ],
                'currentSearchFields' => ['user', 'title'],
                'listRouteName' => 'admin.request.list',
                'showRouteName' => 'admin.request.show',
                'actions' => $this->buildActions([
                    $this->createPrimaryAction('New Request', route('request.create'), 'PlusIcon'),
                    $this->createSecondaryAction('Export CSV', route('admin.request.export.csv'), 'ArrowDownTrayIcon'),
                ]),
                'resourceClass' => RequestResource::class,
                'serviceMethod' => 'getPaginatedRequests',
                'additionalData' => ['availableStatuses' => $this->service->getAvailableStatuses()],
            ],
            'user_own' => [
                'component' => 'request/List',
                'title' => 'My requests',
                'banner' => [
                    'title' => 'List of my requests',
                    'description' => 'Manage your requests here.',
                ],
                'searchFields' => [
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                ],
                'currentSearchFields' => ['title'],
                'listRouteName' => 'request.me.list',
                'showRouteName' => 'request.show',
                'routeName' => 'request.me.list',
                'actions' => $this->buildActions([
                    $this->createPrimaryAction('Submit new request', route('request.create'), 'PlusIcon'),
                ]),
                'resourceClass' => RequestResource::class,
                'serviceMethod' => 'getUserRequests',
                'requiresUser' => true,
            ],
            'public' => [
                'component' => 'request/List',
                'title' => 'View Request for Training workshops',
                'banner' => [
                    'title' => 'View Request for Training workshops',
                    'description' => 'View requests for training and workshops.',
                ],
                'searchFields' => [
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                    ['name' => 'status', 'label' => 'Status', 'type' => 'select', 'options' => [
                        ['label' => 'Open', 'value' => 'open'],
                        ['label' => 'Closed', 'value' => 'closed'],
                    ]],
                ],
                'currentSearchFields' => ['title'],
                'listRouteName' => 'request.list',
                'showRouteName' => 'request.show',
                'routeName' => 'request.list',
                'resourceClass' => PublicRequestResource::class,
                'serviceMethod' => 'getPublicRequests',
            ],
            'matched' => [
                'component' => 'request/List',
                'title' => 'View my matched requests',
                'banner' => [
                    'title' => 'View my matched requests',
                    'description' => 'View and browse my matched Request.',
                ],
                'searchFields' => [
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                ],
                'currentSearchFields' => ['title'],
                'listRouteName' => 'request.me.matched-requests',
                'showRouteName' => 'request.show',
                'routeName' => 'request.me.matched-requests',
                'resourceClass' => RequestResource::class,
                'serviceMethod' => 'getMatchedRequests',
                'requiresUser' => true,
            ],
            'subscribed' => [
                'component' => 'request/List',
                'title' => 'View my subscribed requests',
                'banner' => [
                    'title' => 'View my subscribed requests',
                    'description' => 'View and browse my subscribed Request.',
                ],
                'searchFields' => [
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                ],
                'currentSearchFields' => ['title'],
                'listRouteName' => 'request.me.subscribed-requests',
                'showRouteName' => 'request.show',
                'routeName' => 'request.me.subscribed-requests',
                'resourceClass' => RequestResource::class,
                'serviceMethod' => 'getSubscribedRequests',
                'requiresUser' => true,
            ],
        };
    }

    /**
     * Get requests based on context
     *
     * @throws \Throwable
     */
    private function getRequestsForContext(
        string $context,
        array $config,
        $user,
        array $searchFilters,
        array $sortFilters
    ) {
        $serviceMethod = $config['serviceMethod'];
        $requiresUser = $config['requiresUser'] ?? false;

        // Call service method dynamically
        if ($requiresUser) {
            return $this->service->$serviceMethod($user, $searchFilters, $sortFilters);
        }

        return $this->service->$serviceMethod($searchFilters, $sortFilters);
    }

    /**
     * Unified invokable method handling all contexts
     *
     * @throws \Throwable
     */
    public function __invoke(Request $httpRequest): Response
    {
        $context = $this->getRouteContext();
        $config = $this->getContextConfiguration($context);

        $searchFilters = $this->buildSearchFilters($httpRequest, $config['searchFields']);
        $sortFilters = $this->buildSortFilters($httpRequest);

        // Fetch requests based on context
        $requests = $this->getRequestsForContext(
            $context,
            $config,
            $httpRequest->user(),
            $searchFilters,
            $sortFilters
        );

        // Transform to appropriate resource
        $requests->toResourceCollection($config['resourceClass']);

        // Build response data
        $responseData = [
            'requests' => $requests,
            'title' => $config['title'],
            'currentSort' => [
                'field' => $sortFilters['field'],
                'order' => $sortFilters['order'],
            ],
            'currentSearch' => $this->buildCurrentSearch($searchFilters, $config['currentSearchFields']),
            'listRouteName' => $config['listRouteName'],
            'showRouteName' => $config['showRouteName'] ?? null,
            'searchFields' => $config['searchFields'] ?? [],
            'actions' => $config['actions'] ?? [],
            'context' => $context,
        ];

        // Add banner if configured
        if (isset($config['banner'])) {
            $responseData['banner'] = $this->buildBanner(
                $config['banner']['title'],
                $config['banner']['description']
            );
        }

        // Add routeName for user contexts (backward compatibility)
        if (isset($config['routeName'])) {
            $responseData['routeName'] = $config['routeName'];
        }

        // Add additional data (e.g., availableStatuses for admin)
        if (isset($config['additionalData'])) {
            $responseData = array_merge($responseData, $config['additionalData']);
        }

        return Inertia::render($config['component'], $responseData);
    }

    /**
     * Export requests to CSV - admin only functionality
     */
    public function exportCsv(ExportService $exportService): StreamedResponse
    {
        return $exportService->exportRequestsCsv();
    }
}
