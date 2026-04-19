<?php

namespace App\Http\Controllers\Opportunities;

use App\Http\Controllers\Controller;
use App\Models\Opportunity;
use App\Services\OpportunityService;
use Exception;
use Illuminate\Http\Request;

class UpdateStatusController extends Controller
{
    public function __construct(private OpportunityService $opportunityService) {}

    public function __invoke(Request $request, Opportunity $opportunity)
    {
        try {
            $statusCode = (int) $request->input('status');
            $this->opportunityService->updateOpportunityStatus($opportunity, $statusCode, $request->user());

            return back()->with('success', 'Opportunity status updated successfully.');
        } catch (Exception $e) {
            return back()->with('error', 'Failed to update opportunity status: '.$e->getMessage());
        }
    }
}
