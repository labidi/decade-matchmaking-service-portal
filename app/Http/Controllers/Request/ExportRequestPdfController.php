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
        $pdf = Pdf::loadView('pdf.ocdrequest', [
            'ocdRequest' => $ocdRequest,
        ]);
        return $pdf->download('request_' . $ocdRequest->id . '.pdf');
    }
}
