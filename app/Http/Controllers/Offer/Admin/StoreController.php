<?php

namespace App\Http\Controllers\Offer\Admin;

use App\Http\Controllers\Offer\BaseOfferController;
use Exception;
use Illuminate\Http\Request;

class StoreController extends BaseOfferController
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate(
            $this->getOfferValidationRules(),
            $this->getOfferValidationMessages()
        );

        try {
            $offer = $this->offerService->createOffer($validated, auth()->user());

            return to_route('admin.offers.show', $offer->id)
                ->with('success', 'Offer created successfully');
        } catch (Exception $e) {
            return $this->handleException(
                $e,
                'create offer',
                ['request_id' => $validated['request_id'] ?? null]
            );
        }
    }
}
