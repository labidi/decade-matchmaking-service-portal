<?php

namespace App\Http\Controllers\Partner;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Opportunity;
use App\Http\Controllers\Controller;

class OpportunityController extends Controller
{

    public function create()
    {
        return Inertia::render('Opportunity/Create', [
            'title' => 'Create a new request',
            'banner' => [
                'title' => 'Create a new Opportunity',
                'description' => 'Create a new Opportunity to get started.',
                'image' => '/assets/img/sidebar.png',
            ],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('dashboard')],
                ['name' => 'Opportunities', 'url' => route('partner.opportunity.list')],
                ['name' => 'Create Opportunity', 'url' => route('partner.opportunity.create')],
            ],
        ]);
    }

    public function store(Request $httpRequest)
    {

        // Validate the request data
        $validatedData = $httpRequest->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string',
            'closing_date' => 'required|string|max:255',
            'coverage_activity' => 'required',
            'implementation_location' => 'required',
            'target_audience' => 'required',
            // 'target_audience_other' => 'required',
            'summary' => 'required',
            'url' => 'required',
        ]);

        try {
            // Check if the user has already submitted an opportunity
            $opportunity = new Opportunity($validatedData);
            $opportunity->user_id = $httpRequest->user()->id;
            $opportunity->status = Opportunity::STATUS['PENDING_REVIEW'];
            $opportunity->save();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error saving Opportunity' . $e->getMessage()], 500);
        }

        // Return a response
        return response()->json(['message' => 'Opportunity created successfully', 'opportunity' => $opportunity], 201);
    }

    public function list(Request $httpRequest)
    {
        // Fetch all opportunities
        $opportunities = Opportunity::where('user_id', $httpRequest->user()->id)->get();

        // Return the opportunities to the view
        return Inertia::render('Opportunity/List', [
            'opportunities' => $opportunities,
            'title' => 'Opportunities',
            'banner' => [
                'title' => 'List of Opportunities',
                'description' => 'Manage your opportunities here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Opportunities', 'url' => route('partner.opportunity.list')],
            ],
        ]);
    }

    public function show($id)
    {
        // Fetch the opportunity by ID
        $opportunity = Opportunity::findOrFail($id);

        // Return the opportunity to the view
        return Inertia::render('Opportunity/Show', [
            'opportunity' => $opportunity,
            'title' => 'Opportunity Details',
            'banner' => [
                'title' => 'Opportunity Details',
                'description' => 'View the details of the selected opportunity.',
                'image' => '/assets/img/sidebar.png',
            ],
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Opportunities', 'url' => route('partner.opportunity.list')],
                ['name' => 'View Opportunity', 'url' => route('partner.opportunity.show', ['id' => $id])],
            ],
        ]);
    }
}
