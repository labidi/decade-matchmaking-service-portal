<?php

namespace App\Http\Controllers\Request;

use App\Http\Resources\RequestResource;
use App\Models\Request as OCDRequest;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ViewController extends BaseRequestController
{
    public function __construct(
        protected readonly RequestService $service
    ) {
    }

    /**
     * Display the full request details - unified method for both admin and user contexts
     * @throws \Throwable
     */
    public function show(Request $request, ?int $id = null): Response
    {
        $userRequest = OCDRequest::with(['status', 'detail', 'user', 'activeOffer.documents'])
            ->findOrFail($id);
        $viewData = [
            'title' => $userRequest->detail?->capacity_development_title
                ? $userRequest->detail->capacity_development_title
                : 'Request #' . $userRequest->id,
            'request' => $userRequest->toResource(RequestResource::class)
        ];

        if ($this->isAdminRoute()) {
            // Admin view - with admin permissions
            $viewData = array_merge($viewData, [
                'availableStatuses' => $this->service->getAvailableStatuses(),
            ]);
        } else {
            $viewData = array_merge($viewData, [
                'banner' => [
                    'title' => $viewData['title'],
                    'description' => 'View my request details here.',
                    'image' => '/assets/img/sidebar.png',
                ]
            ]);
        }
        return Inertia::render($this->getViewPrefix() . 'Request/Show', $viewData);
    }

}
