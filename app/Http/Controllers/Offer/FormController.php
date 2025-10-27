<?php

namespace App\Http\Controllers\Offer;

use App\Models\Request\Offer;
use App\Services\OfferService;
use App\Services\RequestService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FormController extends BaseOfferController
{
    public function __construct(
        private readonly RequestService $requestService,
        OfferService $offerService
    ) {
        parent::__construct($offerService);
    }


    public function __invoke(Request $request, $id = null): Response
    {
        $requestId = $request->get('request_id');
        $selectedRequest = null;

        if ($id) {
            $offer = $this->offerService->getOfferById($id);
        } else {
            $offer = new Offer();
        }
        if ($requestId) {
            $selectedRequest = $this->requestService->findRequest($requestId);
            $offer->request_id = $selectedRequest->id;
        }

        $partners = $this->getPartnersForSelection();
        $breadcrumbs = $this->buildOfferBreadcrumbs('create', null, $selectedRequest?->id);

        return Inertia::render('admin/Offers/Create', [
            'formOptions' => [
                'availableRequests' => $this->requestService->getAllRequests()->map(function ($request) {
                    return [
                        'label' => '#' . $request->id . ' - ' . ($request->detail?->capacity_development_title ?? 'Untitled') . ' - ' . $request->user->name,
                        'value' => $request->id
                    ];
                }),
                'partners' => $partners,
            ],
            'offer' => $offer,
            'breadcrumbs' => $breadcrumbs
        ]);
    }
}
