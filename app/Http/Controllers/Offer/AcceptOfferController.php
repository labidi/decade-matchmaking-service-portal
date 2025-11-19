<?php

namespace App\Http\Controllers\Offer;

use App\Events\OfferAccepted;
use App\Models\Request\Offer;
use App\Models\SystemNotification;
use App\Models\User;
use App\Services\OfferService;
use App\Services\UserService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

readonly class AcceptOfferController
{
    public function __construct(
        private OfferService $offerService,
        private UserService  $userService
    ) {}

    /**
     * Accept an offer
     */
    public function __invoke(Request $request, int $offerId): RedirectResponse
    {
        try {
            $user = $request->user();
            $offer = $this->offerService->getOfferById($offerId);
            $acceptedOffer = $this->offerService->acceptOffer($offer, $user);
            return to_route('request.me.show', [
                $offer->request->id,
            ])->with('success', 'Offer accepted successfully');
        } catch (Exception|\Throwable $exception) {
            return to_route('request.me.show', [
                $offer->request->id,
            ])->with('error', 'Failed to accept offer: '.$exception->getMessage());
        }
    }
}
