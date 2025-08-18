<?php

namespace App\Http\Controllers\Offer\Admin;

use App\Http\Controllers\Offer\BaseOfferController;
use App\Services\OfferService;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ListController extends BaseOfferController
{
    public function __construct(
        private readonly OfferService $offerService,
        private readonly RequestService $requestService
    ) {
    }

    public function __invoke(Request $request): Response
    {
        $filters = $this->buildFilters($request);
        $offers = $this->offerService->getPaginatedOffers($filters['search'], $filters['sort']);
        $breadcrumbs = $this->buildOfferBreadcrumbs('list');

        return Inertia::render('Admin/Offers/List', [
            'offers' => $offers,
            'currentSort' => $filters['current']['sort'],
            'currentSearch' => $filters['current']['search'],
            'searchFieldsOptions' => [
                'requests' => $this->requestService->getAllRequests()->map(function ($request) {
                    return [
                        'label' => '#' . $request->id . ' - ' . ($request->detail?->capacity_development_title ?? 'Untitled') . ' - ' . $request->user->name,
                        'value' => $request->id
                    ];
                })
            ],
            'routeName' => 'admin.offer.list',
            'breadcrumbs' => $breadcrumbs
        ]);
    }
}
