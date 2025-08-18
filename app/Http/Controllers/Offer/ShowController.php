<?php

namespace App\Http\Controllers\Offer;

use App\Services\OfferService;
use App\Services\RequestService;
use Inertia\Inertia;
use Inertia\Response;

class ShowController extends BaseOfferController
{
    public function __construct(OfferService $offerService)
    {
        parent::__construct($offerService);
    }

    /**
     * @throws \Exception
     */
    public function __invoke(int $id): Response
    {
        $offer = $this->offerService->getOfferById($id);

        return Inertia::render('Admin/Offers/Show', [
            'offer' => $offer,
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('admin.dashboard.index')],
                ['name' => 'Manage offers', 'url' => route('admin.offer.list')],
                ['name' => 'Offer #' . $offer->id, 'url' => route('admin.offer.show', $offer->id)],
            ],
        ]);
    }
}
