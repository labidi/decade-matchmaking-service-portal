<?php

namespace App\Http\Controllers;

use App\Models\Request as OCDRequest;
use App\Models\Request\RequestOffer;
use App\Models\Document;
use Illuminate\Http\Request as HttpRequest;
use App\Enums\RequestOfferStatus;
use App\Enums\DocumentType;

class RequestOfferController extends Controller
{
    public function store(HttpRequest $httpRequest, OCDRequest $request)
    {
        try {
            $validated = $httpRequest->validate([
                'description' => 'required|string|max:1000',
                'partner_id' => 'required|string|max:255',
                'file' => 'required|file|mimes:pdf|max:10240', // 10MB max
            ]);

            // Check if user is authenticated
            if (!$httpRequest->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required',
                    'error' => 'User not authenticated'
                ], 401);
            }

            // Check if request exists and is accessible
            if (!$request) {
                return response()->json([
                    'success' => false,
                    'message' => 'Request not found',
                    'error' => 'The specified request does not exist'
                ], 404);
            }

            // Create the offer
            $offer = new RequestOffer();
            $offer->description = $validated['description'];
            $offer->matched_partner_id = $validated['partner_id'];
            $offer->request_id = $request->id;
            $offer->status = RequestOfferStatus::ACTIVE;
            
            if (!$offer->save()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create offer',
                    'error' => 'Database error occurred while saving the offer'
                ], 500);
            }

            // Handle file upload
            try {
                $path = $httpRequest->file('file')->store('documents', 'public');
                
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
                    'name' => $httpRequest->file('file')->getClientOriginalName(),
                    'path' => $path,
                    'file_type' => $httpRequest->file('file')->getClientMimeType(),
                    'document_type' => DocumentType::OFFER_DOCUMENT,
                    'parent_id' => $offer->id,
                    'parent_type' => RequestOffer::class,
                    'uploader_id' => $httpRequest->user()->id,
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

        } catch (\Illuminate\Validation\ValidationException $validationException) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validationException->errors()
            ], 422);

        } catch (\Exception $exception) {
            \Log::error('RequestOffer store error: ' . $exception->getMessage(), [
                'request_id' => $request->id ?? null,
                'user_id' => $httpRequest->user()->id ?? null,
                'exception' => $exception
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred',
                'error' => config('app.debug') ? $exception->getMessage() : 'Internal server error'
            ], 500);
        }
    }
    public function list(HttpRequest $httpRequest, OCDRequest $request)
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

            // Get offers for the request
            $requestOffers = $request->offers()->with('documents')->get();

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

    public function updateStatus(HttpRequest $httpRequest, OCDRequest $request, RequestOffer $offer)
    {
        try {
            $validated = $httpRequest->validate([
                'status' => 'required|in:' . implode(',', RequestOfferStatus::values()),
            ]);

            // Check if user is authenticated and has permission
            if (!$httpRequest->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required',
                    'error' => 'User not authenticated'
                ], 401);
            }

            // Check if offer belongs to the request
            if ($offer->request_id !== $request->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid offer',
                    'error' => 'Offer does not belong to the specified request'
                ], 400);
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
                    'updated_at' => $offer->updated_at
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $validationException) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validationException->errors()
            ], 422);

        } catch (\Exception $exception) {
            \Log::error('RequestOffer updateStatus error: ' . $exception->getMessage(), [
                'request_id' => $request->id ?? null,
                'offer_id' => $offer->id ?? null,
                'user_id' => $httpRequest->user()->id ?? null,
                'exception' => $exception
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred',
                'error' => config('app.debug') ? $exception->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
