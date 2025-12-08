<?php

declare(strict_types=1);

namespace App\Http\Controllers\Opportunities;

use App\Http\Controllers\Controller;
use App\Models\Opportunity;
use App\Services\Opportunity\OpportunityExportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Controller for exporting opportunities to CSV
 */
class ExportController extends Controller
{
    /**
     * Export opportunities to CSV file
     *
     * @param OpportunityExportService $exportService
     * @return StreamedResponse|RedirectResponse
     */
    public function __invoke(OpportunityExportService $exportService): StreamedResponse|RedirectResponse
    {
        try {
            Gate::authorize('viewAny', Opportunity::class);

            return $exportService->exportOpportunitiesCsv();
        } catch (\Exception $exception) {
            return redirect()
                ->route('admin.opportunity.list')
                ->with('error', 'Failed to export opportunities: ' . $exception->getMessage());
        }
    }
}
