<?php

declare(strict_types=1);

namespace App\Http\Controllers\Offer;

use App\Models\Document;
use App\Models\Request\Offer;
use App\Services\OfferService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class DeleteDocumentController extends BaseOfferController
{
    public function __construct(OfferService $offerService)
    {
        parent::__construct($offerService);
    }

    /**
     * Delete a document
     */
    public function __invoke(int $offerId, int $documentId): JsonResponse|RedirectResponse
    {
        try {
            $offer = Offer::findOrFail($offerId);
            $document = Document::where('parent_id', $offerId)
                ->where('parent_type', Offer::class)
                ->findOrFail($documentId);
            //@toDo : replace with proper policy method
            // Authorize delete access
            $this->authorize('update', $offer);

            // Delete the document
            $this->offerService->deleteDocument($document);

            return $this->getSuccessResponse('Document deleted successfully');
        } catch (Exception | \Throwable $e) {
            return $this->handleException($e, 'document deletion', [
                'offer_id' => $offerId,
                'document_id' => $documentId,
            ]);
        }
    }
}
