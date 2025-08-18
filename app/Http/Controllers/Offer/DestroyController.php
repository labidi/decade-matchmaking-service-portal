<?php

namespace App\Http\Controllers\Offer;

use App\Services\OfferService;
use Exception;

class DestroyController extends BaseOfferController
{
    public function __construct(OfferService $offerService)
    {
        parent::__construct($offerService);
    }

    public function __invoke(int $id)
    {
        try {
            $this->offerService->deleteOffer($id, auth()->user());

            return $this->getSuccessResponse(
                'Offer deleted successfully',
                'admin.offer.list'
            );
        } catch (Exception $e) {
            return $this->handleException(
                $e,
                'delete offer',
                ['offer_id' => $id]
            );
        }
    }
}
