<?php

namespace App\Http\Controllers\Opportunities;

use App\Http\Controllers\Controller;
use App\Services\OpportunityService;
use Illuminate\Http\Request;
use Exception;

class DestroyController extends Controller
{
    public function __construct(private OpportunityService $opportunityService)
    {
    }

    public function __invoke(Request $request, int $id)
    {
        try {
            $this->opportunityService->deleteOpportunity($id, $request->user());

            return back()->with('success', 'Opportunity deleted successfully.');
        } catch (Exception $e) {
            return back()->with('error', 'Opportunity not deleted. Error was : ' . $e->getMessage());
        }
    }
}
