<?php

namespace App\Http\Controllers\Offer;

use App\Services\OfferService;
use App\Services\RequestService;
use Inertia\Inertia;
use Inertia\Response;

class EditController extends BaseOfferController
{
    public function __construct(OfferService $offerService, ?RequestService $requestService = null)
    {
        parent::__construct($offerService, $requestService);
    }

    /**
     * @throws \Exception
     */
    public function __invoke(int $id): Response
    {
        $offer = $this->offerService->getOfferById($id);
        $partners = $this->getPartnersWithDetails();
        $breadcrumbs = $this->buildOfferBreadcrumbs('edit', $id);

        return Inertia::render('admin/Offers/Edit', [
            'offer' => $offer,
            'partners' => $partners,
            'breadcrumbs' => $breadcrumbs,
        ]);
    }
}
