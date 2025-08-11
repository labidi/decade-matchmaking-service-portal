<?php

namespace App\Http\Controllers\Request;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\RequestEnhancer;
use App\Models\Request as OCDRequest;

class RequestViewController extends BaseRequestController
{
    /**
     * Display the full request details - unified method for both admin and user contexts
     */
    public function show(Request $request, ?int $id = null): Response
    {
        $userRequest = OCDRequest::with(['status', 'detail', 'user', 'offers'])
            ->findOrFail($id);

        if ($this->isAdminRoute()) {
            // Admin view - simplified
            $viewData = [
                'title' => $this->service->getRequestTitle($userRequest),
                'request' => $userRequest,
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

        // User view - with enhanced data and actions
        $activeOffer = $this->service->getActiveOfferWithDocuments($id);
        $actions = $this->service->getRequestActions($userRequest, $request->user());

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
            'request' => $userRequest,
            'activeOffer' => $activeOffer,
            'requestDetail.actions' => $actions,
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

        return Inertia::render('Request/Preview', [
            'title' => 'Request : ' . $this->service->getRequestTitle($ocdRequest),
            'banner' => [
                'title' => 'Request : ' . $this->service->getRequestTitle($ocdRequest),
                'description' => 'View my request details here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'request' => $ocdRequest,
            'offer' => $offer,
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Requests', 'url' => route('request.me.list')],
                [
                    'name' => 'View Request #' . $ocdRequest->id,
                    'url' => route('request.show', ['id' => $ocdRequest->id])
                ],
            ],
            'requestDetail.actions' => [
                'canEdit' => false,
                'canDelete' => false,
                'canCreate' => false,
                'canExpressInterest' => false,
                'canExportPdf' => false,
                'canAcceptOffer' => false,
                'canRequestClarificationForOffer' => false
            ],
        ]);
    }
}
