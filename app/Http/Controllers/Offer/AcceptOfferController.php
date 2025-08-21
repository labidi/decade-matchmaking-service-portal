<?php

namespace App\Http\Controllers\Offer;

use App\Http\Controllers\Offer\BaseOfferController;
use App\Services\OfferService;
use App\Events\OfferAccepted;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AcceptOfferController extends BaseOfferController
{
    /**
     * Accept an offer
     */
    public function __invoke(Request $request, int $offerId): RedirectResponse
    {
        try {
            $user = $request->user();
            $offer = $this->offerService->getOfferById($offerId);
            $acceptedOffer = $this->offerService->acceptOffer($offer, $user);
            event(new OfferAccepted($acceptedOffer, $user));
            return to_route('request.show')->with('success', 'Offer accepted successfully');
        } catch (Exception $exception) {
            return to_route('request.show', [
                'id' => $offer->request->id,
            ])->with('error', 'Failed to accept offer: ' . $exception->getMessage());
        }
    }
}
