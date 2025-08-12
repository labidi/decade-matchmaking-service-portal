<?php

namespace App\Http\Controllers\Offer;

use App\Enums\RequestOfferStatus;
use App\Http\Requests\UpdateRequestOfferStatus;
use Exception;
use Illuminate\Http\RedirectResponse;

class UpdateStatusController extends BaseOfferController
{
    public function __invoke(UpdateRequestOfferStatus $statusRequest, $id): RedirectResponse
    {
        try {
            $validated = $statusRequest->validated();
            $offer = $this->offerService->getOfferById($id);
            
            switch ($validated['status']) {
                case RequestOfferStatus::ACTIVE->value:
                    $this->offerService->changeOfferStatus($offer, RequestOfferStatus::ACTIVE);
                    break;
                case RequestOfferStatus::INACTIVE->value:
                    $this->offerService->changeOfferStatus($offer, RequestOfferStatus::INACTIVE);
                    break;
                default:
                    return $this->getErrorResponse(
                        'Invalid status provided',
                        null,
                        400,
                        'admin.offers.list'
                    );
            }
            
            return $this->getSuccessResponse(
                'Offer status updated successfully',
                'admin.offers.list'
            );
        } catch (Exception $exception) {
            return $this->handleException(
                $exception,
                'update offer status',
                ['offer_id' => $id]
            );
        }
    }
}
