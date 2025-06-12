<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Opportunity;
use App\Enums\OpportunityStatus;
use App\Http\Controllers\Controller;

class OcdOpportunityController extends Controller
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
                ['name' => 'Opportunities', 'url' => route('opportunity.list')],
                ['name' => 'Create Opportunity', 'url' => route('partner.opportunity.create')],
            ],
        ]);
    }

    public function store(Request $httpRequest)
    {

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
            $opportunity = new Opportunity($validatedData);
            $opportunity->user_id = $httpRequest->user()->id;
            $opportunity->status = OpportunityStatus::PENDING_REVIEW;
            $opportunity->save();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error saving Opportunity' . $e->getMessage()], 500);
        }
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
                ['name' => 'Opportunities', 'url' => route('opportunity.list')],
            ],
            'PageActions' => [
                "canAddNew" => true
            ],
        ]);
    }

    public function browse(Request $httpRequest)
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
                ['name' => 'Opportunities', 'url' => route('opportunity.list')],
            ],
            'PageActions' => [
                "canAddNew" => false
            ],
        ]);
    }

    public function show(int $id)
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
                ['name' => 'Opportunities', 'url' => route('opportunity.list')],
                ['name' => 'View Opportunity', 'url' => route('opportunity.show', ['id' => $id])],
            ],
        ]);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $id)
    {
        $opportunity = Opportunity::findOrFail($id);
        if (!$opportunity) {
            return response()->json(['error' => 'Ocd Opportunity not found'], 404);
        }

        return Inertia::render('Opportunity/Create', [
            'title' => 'Edit Opportunity : '.$opportunity->title,
            'banner' => [
                'title' => 'Edit Opportunity : '.$opportunity->title,
                'description' => 'Edit my Opportunity details here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'request' => $opportunity->toArray(),
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Opportunities', 'url' => route('opportunity.list')],
                ['name' => 'Edit Request #' . $opportunity->id, 'url' => route('opportunity.edit', ['id' => $opportunity->id])],
            ],
        ]);
    }

    public function updateStatus(Request $httpRequest, int $opportunityId)
    {
        $statusCode = (int) $httpRequest->input('status');
        $opportunity = Opportunity::find($opportunityId);
        if (!$opportunity) {
            return response()->json(['error' => 'Opportunity not found'], 404);
        }
        if (!in_array($statusCode, array_column(OpportunityStatus::cases(), 'value'))) {
            return response()->json(['error' => 'Status not found'], 422);
        }

        $opportunity->status = $statusCode;
        $opportunity->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'status' => [
                'status_code' => (string) $statusCode,
                'status_label' => Opportunity::STATUS_LABELS[$statusCode] ?? ''
            ]
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $opportunity = Opportunity::find($id);
        if (!$opportunity) {
            return response()->json(['error' => 'Opportunity not found'], 404);
        }

        if ($opportunity->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($opportunity->status !== OpportunityStatus::PENDING_REVIEW) {
            return response()->json(['error' => 'Only pending review opportunities can be deleted'], 422);
        }

        $opportunity->delete();

        return response()->json(['message' => 'Opportunity deleted successfully']);
    }
}
