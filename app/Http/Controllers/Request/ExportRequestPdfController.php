<?php

namespace App\Http\Controllers\Request;

use App\Services\RequestService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class ExportRequestPdfController extends BaseRequestController
{
    public function __construct(private readonly RequestService $requestService)
    {
    }

    /**
     * Export request as PDF
     */
    public function __invoke(int $requestId)
    {
        $ocdRequest = $this->requestService->findRequest($requestId);

        // Eager load all relationships to avoid N+1 queries and ensure data availability
        $ocdRequest->load([
            'detail',                           // Normalized request data
            'user',                             // Request owner
            'status',                           // Request status
            'matchedPartner',                   // Matched partner (if exists)
            'activeOffer.matchedPartner',       // Active offer with partner info
            'activeOffer.documents.uploader',   // Offer documents with uploader info
        ]);

        $pdf = Pdf::loadView('pdf.ocdrequest', [
            'ocdRequest' => $ocdRequest,
        ]);
        return $pdf->download('request_' . $ocdRequest->id . '.pdf');
    }
}
