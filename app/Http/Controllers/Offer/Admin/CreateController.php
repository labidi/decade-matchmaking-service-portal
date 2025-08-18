<?php

namespace App\Http\Controllers\Offer\Admin;

use App\Http\Controllers\Offer\BaseOfferController;
use App\Services\OfferService;
use App\Services\RequestService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreateController extends BaseOfferController
{
    public function __construct(
        private readonly RequestService $requestService
    ) {
    }


    public function __invoke(Request $request): Response
    {
        $requestId = $request->get('request_id');
        $selectedRequest = null;

        if ($requestId) {
            try {
                $selectedRequest = $this->requestService->getRequestById($requestId, auth()->user());
            } catch (Exception $e) {
                // Request not found or unauthorized - continue without selected request
            }
        }

        $partners = $this->getPartnersWithDetails();
        $breadcrumbs = $this->buildOfferBreadcrumbs('create', null, $selectedRequest?->id);

        return Inertia::render('Admin/Offers/Create', [
            'selectedRequest' => $selectedRequest,
            'partners' => $partners,
            'availableRequests' => $this->requestService->getAllRequests()->map(function ($request) {
                return [
                    'label' => '#' . $request->id . ' - ' . ($request->detail?->capacity_development_title ?? 'Untitled') . ' - ' . $request->user->name,
                    'value' => $request->id
                ];
            }),
            'breadcrumbs' => $breadcrumbs
        ]);
    }
}
