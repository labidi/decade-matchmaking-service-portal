<?php

namespace App\Http\Controllers\Offer\Admin;

use App\Http\Controllers\Offer\BaseOfferController;
use App\Services\OfferService;
use Exception;
use Illuminate\Http\Request;

class UpdateController extends BaseOfferController
{
    public function __construct(private readonly OfferService $offerService)
    {
    }

    public function __invoke(Request $request, int $id)
    {
        $validated = $request->validate(
            $this->getOfferValidationRules(true),
            $this->getOfferValidationMessages()
        );

        try {
            $offer = $this->offerService->updateOffer($id, $validated, auth()->user());

            return to_route('admin.offer.show', $offer->id)
                ->with('success', 'Offer updated successfully');
        } catch (Exception $e) {
            return $this->handleException(
                $e,
                'update offer',
                ['offer_id' => $id]
            );
        }
    }
}
