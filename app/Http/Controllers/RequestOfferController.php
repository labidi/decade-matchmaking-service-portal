<?php

namespace App\Http\Controllers;

use App\Models\Request as OCDRequest;
use App\Models\Request\Offer;
use App\Models\Document;
use Illuminate\Http\Request as HttpRequest;
use App\Enums\RequestOfferStatus;
use App\Enums\DocumentType;
use App\Http\Requests\StoreRequestOffer;
use App\Http\Requests\UpdateRequestOfferStatus;
use Illuminate\Http\JsonResponse;
use App\Models\User;

class RequestOfferController extends Controller
{
    /**
     * Store a newly created offer in storage.
     *
     * @param StoreRequestOffer $offerRequest
     * @param OCDRequest $request
     * @return JsonResponse
     */
    public function store(StoreRequestOffer $offerRequest, OCDRequest $request): JsonResponse
    {
        try {
            // Check if request exists and is accessible
            if (!$request) {
                return response()->json([
                    'success' => false,
                    'message' => 'Request not found',
                    'error' => 'The specified request does not exist'
                ], 404);
            }

            // Check if there's already an active offer for this request
            $existingActiveOffer = $request->offers()
                ->where('status', RequestOfferStatus::ACTIVE)
                ->first();

            if ($existingActiveOffer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot create offer',
                    'error' => 'This request already has an active offer. Only one active offer is allowed per request.'
                ], 422);
            }

            // Get validated data from Form Request
            $validated = $offerRequest->validated();

            // Create the offer
            $offer = new Offer();
            $offer->description = $validated['description'];
            $offer->matched_partner_id = $validated['partner_id'];
            $offer->request_id = $request->id;
            $offer->status = RequestOfferStatus::INACTIVE;

            if (!$offer->save()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create offer',
                    'error' => 'Database error occurred while saving the offer'
                ], 500);
            }

            // Handle file upload
            try {
                $uploadedFile = $offerRequest->file('document');
                $path = $uploadedFile->store('documents', 'public');

                if (!$path) {
                    // If file upload failed, delete the offer and return error
                    $offer->delete();
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to upload file',
                        'error' => 'File upload failed'
                    ], 500);
                }

                // Create document record
                $document = Document::create([
                    'name' => $uploadedFile->getClientOriginalName(),
                    'path' => $path,
                    'file_type' => $uploadedFile->getClientMimeType(),
                    'document_type' => DocumentType::OFFER_DOCUMENT,
                    'parent_id' => $offer->id,
                    'parent_type' => Offer::class,
                    'uploader_id' => $offerRequest->user()->id,
                ]);

                if (!$document) {
                    // If document creation failed, delete the offer and uploaded file
                    $offer->delete();
                    \Storage::disk('public')->delete($path);
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to create document record',
                        'error' => 'Database error occurred while saving document information'
                    ], 500);
                }

            } catch (\Exception $fileException) {
                // If file handling failed, delete the offer and return error
                $offer->delete();
                return response()->json([
                    'success' => false,
                    'message' => 'File processing error',
                    'error' => $fileException->getMessage()
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Offer submitted successfully',
                'data' => [
                    'offer_id' => $offer->id,
                    'request_id' => $request->id,
                    'partner_id' => $validated['partner_id'],
                    'document_id' => $document->id ?? null
                ]
            ], 201);

        } catch (\Exception $exception) {
            \Log::error('RequestOffer store error: ' . $exception->getMessage(), [
                'request_id' => $request->id ?? null,
                'user_id' => $offerRequest->user()->id ?? null,
                'exception' => $exception
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred',
                'error' => config('app.debug') ? $exception->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Display a listing of offers for a specific request.
     *
     * @param HttpRequest $httpRequest
     * @param OCDRequest $request
     * @return JsonResponse
     */
    public function list(HttpRequest $httpRequest, OCDRequest $request): JsonResponse
    {
        try {
            // Check if request exists
            if (!$request) {
                return response()->json([
                    'success' => false,
                    'message' => 'Request not found',
                    'error' => 'The specified request does not exist'
                ], 404);
            }

            // Get offers for the request with eager loading
            $requestOffers = $request->offers()
                ->with(['documents' => function ($query) {
                    $query->select('id', 'name', 'path', 'parent_id', 'parent_type');
                }])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Offers retrieved successfully',
                'data' => [
                    'offers' => $requestOffers,
                    'count' => $requestOffers->count()
                ]
            ], 200);

        } catch (\Exception $exception) {
            \Log::error('RequestOffer list error: ' . $exception->getMessage(), [
                'request_id' => $request->id ?? null,
                'exception' => $exception
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve offers',
                'error' => config('app.debug') ? $exception->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update the status of a specific offer.
     *
     * @param UpdateRequestOfferStatus $statusRequest
     * @param OCDRequest $request
     * @param Offer $offer
     * @return JsonResponse
     */
    public function updateStatus(UpdateRequestOfferStatus $statusRequest, OCDRequest $request, Offer $offer): JsonResponse
    {
        try {
            // Check if offer belongs to the request
            if ($offer->request_id !== $request->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid offer',
                    'error' => 'Offer does not belong to the specified request'
                ], 400);
            }

            // Get validated data from Form Request
            $validated = $statusRequest->validated();

            // If we're activating an offer, deactivate all other active offers for this request
            if ($validated['status'] === RequestOfferStatus::ACTIVE) {
                $request->offers()
                    ->where('id', '!=', $offer->id)
                    ->where('status', RequestOfferStatus::ACTIVE)
                    ->update(['status' => RequestOfferStatus::INACTIVE]);
            }

            $offer->status = $validated['status'];

            if (!$offer->save()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update offer status',
                    'error' => 'Database error occurred while updating the offer'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Offer status updated successfully',
                'data' => [
                    'offer_id' => $offer->id,
                    'status' => $offer->status,
                    'status_label' => $offer->status_label,
                    'updated_at' => $offer->updated_at
                ]
            ], 200);

        } catch (\Exception $exception) {
            \Log::error('RequestOffer updateStatus error: ' . $exception->getMessage(), [
                'request_id' => $request->id ?? null,
                'offer_id' => $offer->id ?? null,
                'user_id' => $statusRequest->user()->id ?? null,
                'exception' => $exception
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred',
                'error' => config('app.debug') ? $exception->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Return all users with the 'partner' role as JSON
     */
    public function partnersList(): JsonResponse
    {
        $partners = User::role('partner')->select('id', 'name', 'email', 'first_name', 'last_name')->get();
        $optionsValues = [] ;
        foreach ($partners as $partner) {
            $optionsValues[] = [
                'value' => $partner->id,
                'label' => $partner->name.' ('.$partner->email.')',
            ];
        }
        return response()->json([
            'success' => true,
            'data' => $optionsValues
        ]);
    }
}
