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
    public function show(Request $request, ?int $requestId = null): Response
    {
        // Handle admin route parameter format (request vs id)
        if ($this->isAdminRoute() && !$requestId) {
            $requestId = (int) $request->route('request');
        }

        if ($this->isAdminRoute()) {
            // Admin view - can see any request
            $ocdRequest = OCDRequest::with(['status', 'detail', 'user', 'offers'])
                ->findOrFail($requestId);
        } else {
            // User view - only their accessible requests
            $ocdRequest = $this->service->findRequest($requestId, $request->user());

            if (!$ocdRequest) {
                abort(404, 'Request not found');
            }
        }
        $title = 'Request : ' . $this->service->getRequestTitle($ocdRequest);
        if ($this->isAdminRoute()) {
            // Admin view - simplified
            $viewData = $this->getShowViewData('Request Details', $ocdRequest, $requestId);
            return Inertia::render($this->getViewPrefix() . 'Request/Show', $viewData);
        }

        // User view - with enhanced data and actions
        $activeOffer = $this->service->getActiveOfferWithDocuments($requestId);
        $actions = $this->service->getRequestActions($ocdRequest, $request->user());

        $viewData = $this->getShowViewData($title, RequestEnhancer::enhanceRequest($ocdRequest), $requestId, [
            'banner' => [
                'title' => $title,
                'description' => 'View my request details here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'activeOffer' => $activeOffer,
            'requestDetail.actions' => $actions,
        ]);

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
