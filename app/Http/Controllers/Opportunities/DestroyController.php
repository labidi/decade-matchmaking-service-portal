<?php

namespace App\Http\Controllers\Opportunities;

use App\Http\Controllers\Controller;
use App\Models\Opportunity;
use App\Services\OpportunityService;
use Illuminate\Http\Request;
use Exception;

class DestroyController extends Controller
{
    public function __construct(private OpportunityService $opportunityService)
    {
    }

    public function __invoke(Request $request, Opportunity $opportunity)
    {
        try {
            $this->opportunityService->deleteOpportunity($opportunity, $request->user());
            return back()->with('success', 'Opportunity deleted successfully.');
        } catch (Exception $e) {
            return back()->with('error', 'Opportunity not deleted. Error was : ' . $e->getMessage());
        }
    }
}
