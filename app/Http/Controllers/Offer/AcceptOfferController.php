<?php

namespace App\Http\Controllers\Offer;

use App\Http\Controllers\Offer\BaseOfferController;
use App\Services\OfferService;
use App\Events\OfferAccepted;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AcceptOfferController extends BaseOfferController
{
    /**
     * Accept an offer
     */
    public function __invoke(Request $request, int $offerId): JsonResponse
    {
        DB::beginTransaction();
        
        try {
            $user = $request->user();
            
            // Get the offer with all necessary relationships
            $offer = $this->offerService->getOfferById($offerId);
            
            // Check authorization - only request owner can accept offers for their request
            if (!$offer->can_accept) {
                return $this->jsonErrorResponse(
                    'Unauthorized to accept this offer',
                    'You can only accept offers for your own requests',
                    403
                );
            }

            // Validate that the offer can be accepted
            if ($offer->is_accepted) {
                return $this->jsonErrorResponse(
                    'Offer already accepted',
                    'This offer has already been accepted',
                    400
                );
            }

            // Accept the offer using the service
            $acceptedOffer = $this->offerService->acceptOffer($offer, $user);
            
            // Fire the event
            event(new OfferAccepted($acceptedOffer, $user));
            
            DB::commit();
            
            Log::info('Offer accepted successfully', [
                'offer_id' => $offerId,
                'request_id' => $offer->request_id,
                'accepted_by' => $user->id,
                'partner_id' => $offer->matched_partner_id
            ]);

            return $this->jsonSuccessResponse(
                'Offer accepted successfully',
                [
                    'offer' => $acceptedOffer->fresh()->load([
                        'request', 
                        'matchedPartner', 
                        'documents'
                    ])
                ]
            );

        } catch (Exception $exception) {
            DB::rollBack();
            
            return $this->handleException(
                $exception,
                'accept offer',
                ['offer_id' => $offerId]
            );
        }
    }
}