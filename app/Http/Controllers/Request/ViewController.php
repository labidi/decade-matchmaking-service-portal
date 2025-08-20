<?php

namespace App\Http\Controllers\Request;

use App\Http\Resources\RequestResource;
use App\Models\Request as OCDRequest;
use App\Services\Request\EnhancerService;
use App\Services\RequestPermissionService;
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
        $userRequest = OCDRequest::with(['status', 'detail', 'user', 'offers','activeOffer.documents'])
            ->findOrFail($id);

        $currentUser = $request->user();

        if ($this->isAdminRoute()) {
            // Admin view - with admin permissions
            $permissions = $this->permissionService->getAdminActions($userRequest, $currentUser);
            $requestResource = RequestResource::withPermissions($userRequest, $permissions);

            $viewData = [
                'title' => $this->service->getRequestTitle($userRequest),
                'request' => $requestResource->forAdmin($permissions),
                'breadcrumbs' => [
                    ['name' => 'Dashboard', 'url' => route('admin.dashboard.index')],
                    ['name' => 'Requests', 'url' => route('admin.request.list')],
                    [
                        'name' => 'View Request #' . $userRequest->id,
                        'url' => route('admin.request.show', ['id' => $userRequest->id])
                    ],
                ],
            ];
            return Inertia::render($this->getViewPrefix() . 'Request/Show', $viewData);
        }

        // User view - with user permissions and enhanced data
        $permissions = $this->permissionService->getActionsForRequest($userRequest, $currentUser);
        $requestResource = RequestResource::withPermissions($userRequest, $permissions);
        $activeOffer = $this->service->getActiveOfferWithDocuments($id);

        $viewData = [
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
            'request' => $requestResource->forUser($permissions),
            'activeOffer' => $activeOffer,
        ];

        return Inertia::render('Request/Show', $viewData);
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
