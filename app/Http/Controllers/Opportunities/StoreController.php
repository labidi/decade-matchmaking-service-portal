<?php

namespace App\Http\Controllers\Opportunities;

use App\Http\Controllers\Controller;
use App\Services\OpportunityService;
use Illuminate\Http\Request;
use Inertia\ResponseFactory;
use Exception;

class StoreController extends Controller
{
    public function __construct(private readonly OpportunityService $opportunityService)
    {
    }

    public function __invoke(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string',
            'closing_date' => 'required|string|max:255',
            'coverage_activity' => 'required',
            'implementation_location' => 'required',
            'target_audience' => 'required',
            'summary' => 'required',
            'url' => 'required',
        ]);

        try {
            $this->opportunityService->createOpportunity($validatedData, $request->user());
            return to_route('opportunity.me.list')->with('success', 'Opportunity submitted successfully');
        } catch (Exception $e) {
            return to_route('opportunity.me.list')->with('error', 'Error while submitting Opportunity');
        }
    }
}
