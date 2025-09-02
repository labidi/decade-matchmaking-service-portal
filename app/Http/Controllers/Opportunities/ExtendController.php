<?php

namespace App\Http\Controllers\Opportunities;

use App\Http\Controllers\Controller;
use App\Models\Opportunity;
use App\Services\OpportunityService;
use Illuminate\Http\Request;

class ExtendController extends Controller
{
    public function __construct(private readonly OpportunityService $opportunityService)
    {
    }

    public function __invoke(Request $request, ?int $id)
    {
        $opportunity = $this->opportunityService->findOpportunity($id);
        if (!$request->user()->can('extend', [Opportunity::class, $opportunity])) {
            return back()->with('error', 'You do not have permission to extend this opportunity.');
        }

        $closingDate = $request->has('closing_date') ? \Carbon\Carbon::parse($request->input('closing_date')) : null;
        $opportunity = $this->opportunityService->extendOpportunityClosingDate($opportunity, $closingDate);
        
        return back()->with('success', 'Opportunity closing date extended successfully until ' . $opportunity->closing_date->toFormattedDateString() . '.');
    }
}
