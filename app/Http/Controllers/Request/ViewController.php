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
        RequestService $service,
        protected readonly RequestPermissionService $permissionService
    ) {
        parent::__construct($service);
    }

    /**
     * Display the full request details - unified method for both admin and user contexts
     */
    public function show(Request $request, ?int $id = null): Response
    {
        $userRequest = OCDRequest::with(['status', 'detail', 'user', 'offers', 'activeOffer.documents'])
            ->findOrFail($id);
        $permissions = $this->permissionService->getPermissions($userRequest, auth()->user());
        $requestResource = RequestResource::withPermissions($userRequest, $permissions);
        $viewData = [
            'title' => $this->service->getRequestTitle($userRequest),
            'request' => $this->isAdminRoute() ? $requestResource->forAdmin($permissions) : $requestResource->forUser($permissions),
        ];

        if ($this->isAdminRoute()) {
            // Admin view - with admin permissions
            $viewData = array_merge($viewData, [
                'breadcrumbs' => [
                    ['name' => 'Dashboard', 'url' => route('admin.dashboard.index')],
                    ['name' => 'Requests', 'url' => route('admin.request.list')],
                    [
                        'name' => 'View Request #' . $userRequest->id,
                        'url' => route('admin.request.show', ['id' => $userRequest->id])
                    ],
                ],
                'availableStatuses' => $this->service->getAvailableStatuses(),
            ]);
        } else {
            $viewData = array_merge($viewData, [
                'banner' => [
                    'title' => $this->service->getRequestTitle($userRequest),
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

    /**
     * Display request preview (read-only mode)
     */
    public function preview(Request $request, int $requestId): Response
    {
        $ocdRequest = $this->service->findRequest($requestId, $request->user());

        if (!$ocdRequest) {
            abort(404, 'Request not found');
        }

        $offer = $this->service->getActiveOffer($requestId);

        // Preview mode disables all actions
        $previewActions = $this->permissionService->getRequestDetailActions($ocdRequest, $request->user());
        // Override all permissions to false for preview mode
        $previewActions = array_map(fn() => false, $previewActions);

        return Inertia::render('Request/Preview', [
            'title' => 'Request : ' . $this->service->getRequestTitle($ocdRequest),
            'banner' => [
                'title' => 'Request : ' . $this->service->getRequestTitle($ocdRequest),
                'description' => 'View my request details here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'request' => RequestResource::withPermissions($ocdRequest, [])->forPublic(),
            'offer' => $offer,
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Requests', 'url' => route('request.me.list')],
                [
                    'name' => 'View Request #' . $ocdRequest->id,
                    'url' => route('request.show', ['id' => $ocdRequest->id])
                ],
            ],
            'requestDetail.actions' => $previewActions,
        ]);
    }
}
