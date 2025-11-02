<?php

namespace App\Http\Controllers\Offer;

use App\Http\Resources\OfferResource;
use App\Services\OfferService;
use App\Services\RequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ListController extends BaseOfferController
{
    public function __construct(
        OfferService $offerService,
        private readonly RequestService $requestService
    ) {
        parent::__construct($offerService);
    }

    /**
     * @throws \Throwable
     */
    public function __invoke(Request $request): Response
    {
        $filters = $this->buildFilters($request);
        $offers = $this->offerService->getPaginatedOffers($filters['search'], $filters['sort']);
        $offers->toResourceCollection(OfferResource::class);

        return Inertia::render('admin/Offers/List', [
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
        ]);
    }
}
