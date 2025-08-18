<?php

namespace App\Http\Controllers\Offer\Admin;

use App\Http\Controllers\Offer\BaseOfferController;
use App\Services\OfferService;
use App\Services\RequestService;
use Inertia\Inertia;
use Inertia\Response;

class ShowController extends BaseOfferController
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
        $breadcrumbs = $this->buildOfferBreadcrumbs('show', $id);

        return Inertia::render('Admin/Offers/Show', [
            'offer' => $offer,
            'breadcrumbs' => $breadcrumbs,
        ]);
    }
}
