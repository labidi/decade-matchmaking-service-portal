<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Http\Resources\RequestResource;
use App\Models\Request as OCDRequest;
use App\Services\Request\RequestContextService;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ViewController extends BaseRequestController
{
    public function __construct(
        protected readonly RequestService $service,
        protected readonly RequestContextService $contextService
    ) {
    }

    /**
     * Display the full request details - unified method for both admin and user contexts
     *
     * @param Request $request HTTP request
     * @param int|null $id Request ID
     * @return Response
     * @throws \Throwable
     */
    public function show(Request $request, ?int $id = null): Response
    {
        $userRequest = OCDRequest::with([
            'status',
            'detail',
            'user',
            'activeOffer.documents',
            'activeOffer.matchedPartner'
        ])->findOrFail($id);

        $requestTitle = $userRequest->detail?->capacity_development_title
            ? $userRequest->detail->capacity_development_title
            : 'Request #' . $userRequest->id;

        $viewData = [
            'title' => $requestTitle,
            'request' => $userRequest->toResource(RequestResource::class),
        ];

        if ($this->isAdminRoute()) {
            // Admin view - with admin permissions
            $viewData = array_merge($viewData, [
                'availableStatuses' => $this->service->getAvailableStatuses(),
            ]);
        } else {
            // User view - get context-aware banner
            $context = $this->getContextFromRequest($request);
            $bannerConfig = $this->contextService->getDetailBannerConfig($context, $requestTitle);

            $viewData = array_merge($viewData, [
                'banner' => $bannerConfig,
                'context' => $context, // Pass context to frontend if needed
            ]);
        }

        return Inertia::render($this->getViewPrefix() . 'request/Show', $viewData);
    }

}
