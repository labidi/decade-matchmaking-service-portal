<?php

namespace App\Http\Controllers\Request;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class ExportRequestPdfController extends BaseRequestController
{
    /**
     * Export request as PDF
     */
    public function __invoke(int $requestId)
    {
        $ocdRequest = $this->service->getRequestForExport($requestId, Auth::user());

        if (!$ocdRequest) {
            return redirect()->back()->with('error', 'Request not found or access denied');
        }

        $pdf = Pdf::loadView('pdf.ocdrequest', [
            'ocdRequest' => $ocdRequest,
        ]);

        return $pdf->download('request_' . $ocdRequest->id . '.pdf');
    }
}