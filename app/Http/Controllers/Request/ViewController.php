<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Http\Resources\RequestResource;
use App\Models\Request as OCDRequest;
use App\Services\Request\RequestContextService;
use App\Services\RequestService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ViewController extends BaseRequestController
{
    public function __construct(
        protected readonly RequestService $service,
        RequestContextService $contextService
    ) {
        parent::__construct($contextService);
    }

    /**
     * Display the full request details - unified method for all contexts.
     *
     * Context is automatically determined from route name:
     * - admin.request.show → admin context
     * - request.me.show → user own context
     * - request.matched.show → matched context
     * - request.subscribed.show → subscribed context
     * - request.public.show → public context
     *
     * @param  Request  $request  HTTP request
     * @param  int|null  $id  Request ID
     * @return Response
     *
     * @throws ModelNotFoundException
     */
    public function show(Request $request, ?int $id = null): Response
    {
        // Fetch request with all necessary relationships
        $userRequest = OCDRequest::with([
            'status',
            'detail',
            'user',
            'activeOffer.documents',
            'activeOffer.matchedPartner',
        ])->findOrFail($id);

        // Extract request title for display
        $requestTitle = $userRequest->detail?->capacity_development_title
            ?? 'Request #'.$userRequest->id;

        // Get context from route name (pure route-based resolution)
        $context = $this->getRouteContext();

        // Build base view data
        $viewData = [
            'title' => $requestTitle,
            'request' => new RequestResource($userRequest, $context),
        ];

        // Add context-specific data
        if ($context === RequestContextService::CONTEXT_ADMIN) {
            // Admin view - include admin-specific tools
            $viewData['availableStatuses'] = $this->service->getAvailableStatuses();
        } else {
            // User/Partner view - include banner and context
            $viewData['banner'] = $this->contextService->getDetailBannerConfig($context, $requestTitle);
            $viewData['context'] = $context;
        }

        return Inertia::render($this->getViewPrefix().'request/Show', $viewData);
    }

}
