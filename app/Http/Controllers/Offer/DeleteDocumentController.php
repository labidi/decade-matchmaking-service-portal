<?php

declare(strict_types=1);

namespace App\Http\Controllers\Offer;

use App\Models\Document;
use App\Models\Request\Offer;
use App\Services\OfferService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

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
            Gate::authorize('delete-document', $document);
            // Delete the document
            $this->offerService->deleteDocument($document);

            return back()->with('success', 'Document deleted successfully');
        } catch (Exception|\Throwable $e) {
            return back()->with('error', 'Failed to delete document: '.$e->getMessage());
        }
    }
}
