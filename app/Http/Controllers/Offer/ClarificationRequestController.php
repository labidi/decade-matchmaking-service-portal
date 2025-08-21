<?php

namespace App\Http\Controllers\Offer;

use App\Http\Controllers\Controller;
use App\Services\OfferService;
use Illuminate\Http\RedirectResponse;

class ClarificationRequestController extends Controller
{
    public function __construct(private readonly OfferService $offerService)
    {
    }

    public function __invoke(int $id): RedirectResponse
    {
        $offer = $this->offerService->getOfferById($id);
        return to_route('request.show', ['id' => $offer->request->id])
            ->with('success', __('Your clarification request has been sent successfully.'));
    }
}
