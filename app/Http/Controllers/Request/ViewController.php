<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Http\Resources\OfferResource;
use App\Http\Resources\RequestResource;
use App\Models\Request as OCDRequest;
use App\Services\OfferService;
use App\Services\Request\RequestActionProvider;
use App\Services\Request\RequestContextService;
use App\Services\RequestService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ViewController extends BaseRequestController
{
    public function __construct(
        protected readonly RequestService $service,
        RequestActionProvider $actionProvider,
        RequestContextService $contextService,
        private readonly OfferService $offerService
    ) {
        parent::__construct($contextService, $actionProvider);
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
     *
     * @throws ModelNotFoundException
     */
    public function show(Request $request, ?int $id = null): Response
    {
        // Fetch request with base relationships
        $userRequest = OCDRequest::with([
            'status',
            'detail',
            'user',
        ])->findOrFail($id);

        // Extract request title for display
        $requestTitle = $userRequest->detail?->capacity_development_title
            ?? 'Request #'.$userRequest->id;

        // Get context from route name (pure route-based resolution)
        $context = $this->getRouteContext();

        // Transform request data and merge actions into it
        $requestData = (new RequestResource($userRequest))->toArray($request);
        $requestData['actions'] = $this->getActions($userRequest, $request->user(), $context, exclude: ['view']);

        // Resolve active offer separately (fetched via service, not eager-loaded)
        $requestData['active_offer'] = $this->resolveActiveOffer($userRequest, $request, $context);

        // Build base view data
        $viewData = [
            'title' => $requestTitle,
            'request' => $requestData,
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

    /**
     * Resolve the active offer with authorization and actions.
     *
     * @param OCDRequest $userRequest
     * @param Request $httpRequest
     * @param string $context
     * @return array|null
     * @throws Throwable
     */
    private function resolveActiveOffer(
        OCDRequest $userRequest,
        Request $httpRequest,
        string $context
    ): ?array
    {
        if (! $this->shouldLoadActiveOffer($context)) {
            return null;
        }

        $activeOffer = $this->offerService->getActiveOfferForRequest($userRequest);

        if (! $activeOffer) {
            return null;
        }

        $user = $httpRequest->user();
        if (! $user?->can('viewActiveOffer', $userRequest)) {
            return null;
        }

        return (new OfferResource($activeOffer))->toArray($httpRequest);
    }

    private function shouldLoadActiveOffer(string $context): bool
    {
        return in_array($context, [
            RequestContextService::CONTEXT_ADMIN,
            RequestContextService::CONTEXT_USER_OWN,
            RequestContextService::CONTEXT_MATCHED,
            RequestContextService::CONTEXT_SUBSCRIBED,
        ], true);
    }
}
