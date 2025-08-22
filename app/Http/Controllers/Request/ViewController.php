<?php

namespace App\Http\Controllers\Request;

use App\Http\Resources\RequestResource;
use App\Models\Request as OCDRequest;
use App\Services\Request\RequestPermissionService;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ViewController extends BaseRequestController
{
    public function __construct(
        protected readonly RequestService $service,
        protected readonly RequestPermissionService $permissionService
    ) {
    }

    /**
     * Display the full request details - unified method for both admin and user contexts
     */
    public function show(Request $request, ?int $id = null): Response
    {
        $userRequest = OCDRequest::with(['status', 'detail', 'user', 'activeOffer.documents'])
            ->findOrFail($id);
        $permissions = $this->permissionService->getPermissions($userRequest, $request->user());
        $requestResource = RequestResource::withPermissions($userRequest, $permissions);
        $viewData = [
            'title' => $userRequest->detail?->capacity_development_title
                ? $userRequest->detail->capacity_development_title
                : 'Request #' . $userRequest->id,
            'request' => $requestResource
        ];

        if ($this->isAdminRoute()) {
            // Admin view - with admin permissions
            $viewData = array_merge($viewData, [
                'breadcrumbs' => [
                    ['name' => 'Dashboard', 'url' => route('admin.dashboard.index')],
                    ['name' => 'Requests', 'url' => route('admin.request.list')],
                    [
                        'name' => $viewData['title'],
                        'url' => route('admin.request.show', ['id' => $userRequest->id])
                    ],
                ],
                'availableStatuses' => $this->service->getAvailableStatuses(),
            ]);
        } else {
            $viewData = array_merge($viewData, [
                'banner' => [
                    'title' => $viewData['title'],
                    'description' => 'View my request details here.',
                    'image' => '/assets/img/sidebar.png',
                ],
                'breadcrumbs' => [
                    ['name' => 'Home', 'url' => route('user.home')],
                    [
                        'name' => 'View Request #' . $userRequest->id,
                        'url' => route('request.show', ['id' => $userRequest->id])
                    ],
                ],
            ]);
        }
        return Inertia::render($this->getViewPrefix() . 'Request/Show', $viewData);
    }

}
