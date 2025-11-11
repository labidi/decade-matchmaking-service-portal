<?php

namespace App\Http\Controllers\Offer;

use App\Http\Controllers\Controller;
use App\Models\Request\Offer;
use App\Models\SystemNotification;
use App\Models\User;
use App\Services\OfferService;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;

class ClarificationRequestController extends Controller
{
    public function __construct(
        private readonly OfferService $offerService,
        private readonly UserService $userService
    ) {}

    public function __invoke(int $id): RedirectResponse
    {
        $offer = $this->offerService->getOfferById($id);
        $this->createSystemNotificationForAdmins(auth()->user(), $offer);

        return to_route('request.show', ['id' => $offer->request->id])
            ->with('success', __('Your clarification request has been sent successfully.'));
    }

    private function createSystemNotificationForAdmins(User $user, Offer $offer)
    {
        foreach ($this->userService->getAllAdmins() as $admin) {
            SystemNotification::create([
                'user_id' => $admin->id,
                'title' => 'Accepted Offer for a request',
                'description' => sprintf(
                    'User <span class="font-bold">%s</span> has requested clarification for the offer on his request <a href="%s" target="_blank" class="font-bold underline">%s</a> ',
                    $user->name,
                    route('request.show', ['id' => $offer->request->id]),
                    $offer->request->detail->capacity_development_title
                ),
                'is_read' => false,
            ]);
        }
    }
}
