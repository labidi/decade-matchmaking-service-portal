<?php

declare(strict_types=1);

namespace App\Http\Controllers\Offer;

use App\Models\Document;
use App\Models\Request\Offer;
use App\Services\DocumentService;
use App\Services\OfferService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DownloadDocumentController extends BaseOfferController
{
    public function __construct(
        OfferService $offerService,
        private readonly DocumentService $documentService
    ) {
        parent::__construct($offerService);
    }

    /**
     * Download a document
     * @throws \Exception
     */
    public function __invoke(Request $request, int $offerId, int $documentId): StreamedResponse
    {
        $offer = Offer::findOrFail($offerId);
        $document = Document::where('parent_id', $offerId)
            ->where('parent_type', Offer::class)
            ->findOrFail($documentId);

        return $this->documentService->getDownloadResponse($document);
    }
}
