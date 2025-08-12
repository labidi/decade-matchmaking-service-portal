<?php

namespace App\Http\Controllers\Offer;

use App\Models\Request as OCDRequest;
use App\Models\Request\Offer;
use App\Models\Document;
use App\Enums\RequestOfferStatus;
use App\Enums\DocumentType;
use App\Http\Requests\StoreRequestOffer;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class StoreController extends BaseOfferController
{
    public function __invoke(StoreRequestOffer $offerRequest, OCDRequest $request): JsonResponse
    {
        try {
            // Check if request already has an active offer
            $existingActiveOffer = $request->offers()
                ->where('status', RequestOfferStatus::ACTIVE)
                ->first();

            if ($existingActiveOffer) {
                return $this->jsonErrorResponse(
                    'Cannot create offer',
                    'This request already has an active offer. Only one active offer is allowed per request.',
                    422
                );
            }

            $validated = $offerRequest->validated();

            $offer = new Offer();
            $offer->description = $validated['description'];
            $offer->matched_partner_id = $validated['partner_id'];
            $offer->request_id = $request->id;
            $offer->status = RequestOfferStatus::INACTIVE;

            if (!$offer->save()) {
                return $this->jsonErrorResponse(
                    'Failed to create offer',
                    'Database error occurred while saving the offer',
                    500
                );
            }

            // Handle document upload
            try {
                $uploadedFile = $offerRequest->file('document');
                $path = $uploadedFile->store('documents', 'public');

                if (!$path) {
                    $offer->delete();
                    return $this->jsonErrorResponse(
                        'Failed to upload file',
                        'File upload failed',
                        500
                    );
                }

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
                    $offer->delete();
                    Storage::disk('public')->delete($path);
                    return $this->jsonErrorResponse(
                        'Failed to create document record',
                        'Database error occurred while saving document information',
                        500
                    );
                }

            } catch (Exception $fileException) {
                $offer->delete();
                return $this->jsonErrorResponse(
                    'File processing error',
                    $fileException->getMessage(),
                    500
                );
            }

            return $this->jsonSuccessResponse(
                'Offer submitted successfully',
                [
                    'offer_id' => $offer->id,
                    'request_id' => $request->id,
                    'partner_id' => $validated['partner_id'],
                    'document_id' => $document->id ?? null
                ],
                201
            );

        } catch (Exception $exception) {
            return $this->handleException(
                $exception,
                'store offer',
                [
                    'request_id' => $request->id ?? null,
                    'user_id' => $offerRequest->user()->id ?? null
                ]
            );
        }
    }
}
