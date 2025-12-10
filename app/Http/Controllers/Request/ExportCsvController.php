<?php

declare(strict_types=1);

namespace App\Http\Controllers\Request;

use App\Http\Controllers\Controller;
use App\Models\Request;
use App\Services\Request\RequestExportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Controller for exporting requests to CSV
 */
class ExportCsvController extends Controller
{
    /**
     * Export requests to CSV file
     *
     * @param RequestExportService $exportService
     * @return StreamedResponse|RedirectResponse
     */
    public function __invoke(RequestExportService $exportService): StreamedResponse|RedirectResponse
    {
        try {
            Gate::authorize('viewAny', Request::class);

            return $exportService->exportRequestsCsv();
        } catch (\Exception $exception) {
            return redirect()
                ->route('admin.request.list')
                ->with('error', 'Failed to export requests: ' . $exception->getMessage());
        }
    }
}
