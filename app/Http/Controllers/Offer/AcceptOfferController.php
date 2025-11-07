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

class AcceptOfferController
{
    public function __construct(
        private readonly OfferService $offerService,
        private readonly UserService $userService
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
            $this->createSystemNotificationForAdmins($user, $offer);
            event(new OfferAccepted($acceptedOffer, $user));

            return to_route('request.show', [
                $offer->request->id,
            ])->with('success', 'Offer accepted successfully');
        } catch (Exception|\Throwable $exception) {
            return to_route('request.show', [
                $offer->request->id,
            ])->with('error', 'Failed to accept offer: '.$exception->getMessage());
        }
    }

    private function createSystemNotificationForAdmins(User $user, Offer $offer)
    {
        foreach ($this->userService->getAllAdmins() as $admin) {
            SystemNotification::create([
                'user_id' => $admin->id,
                'title' => 'Accepted Offer for a request',
                'description' => sprintf(
                    'User <span class="font-bold">%s</span> has accepted offer for request <a href="%s" target="_blank" class="font-bold underline">%s</a> ',
                    $user->name,
                    route('request.show', ['id' => $offer->request->id]),
                    $offer->request->detail->capacity_development_title
                ),
                'is_read' => false,
            ]);
        }
    }
}
