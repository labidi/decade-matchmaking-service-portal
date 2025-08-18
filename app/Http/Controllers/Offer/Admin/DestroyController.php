<?php

namespace App\Http\Controllers\Offer\Admin;

use App\Http\Controllers\Offer\BaseOfferController;
use Exception;

class DestroyController extends BaseOfferController
{
    public function __invoke(int $id)
    {
        try {
            $this->offerService->deleteOffer($id, auth()->user());

            return $this->getSuccessResponse(
                'Offer deleted successfully',
                'admin.offers.list'
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
