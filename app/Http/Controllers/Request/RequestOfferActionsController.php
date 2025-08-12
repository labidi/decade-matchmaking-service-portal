<?php

namespace App\Http\Controllers\Request;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Request as OCDRequest;
use App\Services\NotificationService;

class RequestOfferActionsController extends BaseRequestController
{
    public function __construct(
        protected readonly \App\Services\RequestService $service,
        protected readonly NotificationService $notificationService
    ) {
        parent::__construct($service);
    }

    /**
     * Accept the active offer for a request
     */
    public function acceptOffer(Request $request, int $requestId): JsonResponse
    {
        try {
            $user = $request->user();
            $ocdRequest = OCDRequest::with(['status', 'activeOffer', 'user'])
                ->findOrFail($requestId);

            // Validate authorization
            if ($ocdRequest->user_id !== $user->id) {
                return response()->json([
                    'error' => 'Unauthorized to accept offer for this request'
                ], 403);
            }

            // Validate request status and active offer
            if ($ocdRequest->status->status_code !== 'offer_made' || !$ocdRequest->activeOffer) {
                return response()->json([
                    'error' => 'No active offer available to accept'
                ], 400);
            }

            // Accept the offer
            $result = $this->service->acceptOffer($ocdRequest, $user);

            if ($result['success']) {
                // Send notification to admin about offer acceptance
                $this->notificationService->notifyAdminOfOfferAcceptance($ocdRequest, $user);

                return response()->json([
                    'message' => 'Offer accepted successfully',
                    'status' => $result['status']
                ]);
            }

            return response()->json([
                'error' => $result['message'] ?? 'Failed to accept offer'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred while accepting the offer'
            ], 500);
        }
    }

    /**
     * Request clarifications from IOC for the active offer
     */
    public function requestClarification(Request $request, int $requestId): JsonResponse
    {
        try {
            $user = $request->user();
            $ocdRequest = OCDRequest::with(['status', 'activeOffer', 'user'])
                ->findOrFail($requestId);

            // Validate authorization
            if ($ocdRequest->user_id !== $user->id) {
                return response()->json([
                    'error' => 'Unauthorized to request clarification for this request'
                ], 403);
            }

            // Validate request status and active offer
            if ($ocdRequest->status->status_code !== 'offer_made' || !$ocdRequest->activeOffer) {
                return response()->json([
                    'error' => 'No active offer available to request clarification for'
                ], 400);
            }

            // Validate request body (optional clarification message)
            $validated = $request->validate([
                'message' => 'nullable|string|max:1000'
            ]);

            // Request clarification
            $result = $this->service->requestClarification($ocdRequest, $user, $validated['message'] ?? null);

            if ($result['success']) {
                // Send notification to admin about clarification request
                $this->notificationService->notifyAdminOfClarificationRequest($ocdRequest, $user, $validated['message'] ?? null);

                return response()->json([
                    'message' => 'Clarification request sent successfully',
                    'status' => $result['status']
                ]);
            }

            return response()->json([
                'error' => $result['message'] ?? 'Failed to request clarification'
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred while requesting clarification'
            ], 500);
        }
    }
}