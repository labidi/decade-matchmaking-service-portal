<?php

namespace App\Http\Controllers;

use App\Enums\OpportunityStatus;
use App\Http\Controllers\Controller;
use App\Models\Data\CountryOptions;
use App\Models\Data\OceanOptions;
use App\Models\Data\OpportunityTypeOptions;
use App\Models\Data\RegionOptions;
use App\Models\Data\TargetAudienceOptions;
use App\Models\Opportunity;
use App\Services\OpportunityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Exception;

class OpportunitiesController extends Controller
{
    protected OpportunityService $opportunityService;

    public function __construct(OpportunityService $opportunityService)
    {
        $this->opportunityService = $opportunityService;
    }

    public function create()
    {
        return Inertia::render('Opportunity/Create', [
            'title' => 'Create a new request',
            'banner' => [
                'title' => 'Create a new Opportunity',
                'description' => 'Create a new Opportunity to get started.',
                'image' => '/assets/img/sidebar.png',
            ],
            'form' => [
                'countries' => CountryOptions::getOptions(),
                'regions' => RegionOptions::getOptions(),
                'oceans' => OceanOptions::getOptions(),
                'targetAudiences' => TargetAudienceOptions::getOptions(),
                'opportunityTypes' => OpportunityTypeOptions::getOptions(),
            ],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Opportunities', 'url' => route('opportunity.list')],
                ['name' => 'Create Opportunity', 'url' => route('partner.opportunity.create')],
            ],
        ]);
    }

    public function store(Request $request)
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
            $opportunity = $this->opportunityService->createOpportunity($validatedData, $request->user());

            return response()->json([
                'message' => 'Opportunity created successfully',
                'opportunity' => $opportunity
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error creating opportunity: ' . $e->getMessage()
            ], 500);
        }
    }

    public function mySubmittedList(Request $httpRequest)
    {
        $sortField = $httpRequest->get('sort', 'created_at');
        $sortOrder = $httpRequest->get('order', 'desc');
        $searchUser = $httpRequest->get('user');
        $searchTitle = $httpRequest->get('title');
        $searchType = $httpRequest->get('type');
        $searchStatus = $httpRequest->get('status');
        $searchLocation = $httpRequest->get('location');

        $searchFilters = array_filter([
            'user' => $searchUser,
            'title' => $searchTitle,
            'type' => $searchType,
            'status' => $searchStatus,
            'location' => $searchLocation,
        ]);

        $sortFilters = [
            'field' => $sortField,
            'order' => $sortOrder,
            'per_page' => 10,
        ];

        $opportunities = $this->opportunityService->getUserOpportunitiesPaginated($httpRequest->user(), $searchFilters, $sortFilters);

        // Append query parameters to pagination links
        $opportunities->appends($httpRequest->only(['sort', 'order', 'user', 'title', 'type', 'status', 'location']));

        return Inertia::render('Opportunity/List', [
            'opportunities' => $opportunities,
            'title' => 'Opportunities',
            'banner' => [
                'title' => 'List of My submitted Opportunities',
                'description' => 'Manage your submitted opportunities here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'currentSort' => [
                'field' => $sortField,
                'order' => $sortOrder,
            ],
            'currentSearch' => [
                'user' => $searchUser ?? '',
                'title' => $searchTitle ?? '',
                'type' => $searchType ?? '',
                'status' => $searchStatus ?? '',
                'location' => $searchLocation ?? '',
            ],
            'locationData' => [
                'countries' => CountryOptions::getOptions(),
                'regions' => RegionOptions::getOptions(),
                'oceans' => OceanOptions::getOptions(),
                'targetAudiences' => TargetAudienceOptions::getOptions(),
                'opportunityTypes' => OpportunityTypeOptions::getOptions(),
            ],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Opportunities', 'url' => route('opportunity.list')],
            ],
            'pageActions' => [
                "canAddNew" => true,
                "canChangeStatus" => false,
                "canDelete" => true,
                "canSubmitNew" => true,
                'canApply' => false
            ],
        ]);
    }

    public function list(Request $httpRequest)
    {
        $sortField = $httpRequest->get('sort', 'created_at');
        $sortOrder = $httpRequest->get('order', 'desc');
        $searchUser = $httpRequest->get('user');
        $searchTitle = $httpRequest->get('title');
        $searchType = $httpRequest->get('type');
        $searchLocation = $httpRequest->get('location');
        $searchClosingDate = $httpRequest->get('closing_date');

        $searchFilters = array_filter([
            'user' => $searchUser,
            'title' => $searchTitle,
            'type' => $searchType,
            'location' => $searchLocation,
            'closing_date' => $searchClosingDate,
        ]);

        $sortFilters = [
            'field' => $sortField,
            'order' => $sortOrder,
            'per_page' => 10,
        ];

        $opportunities = $this->opportunityService->getPublicOpportunitiesPaginated($searchFilters, $sortFilters);

        // Append query parameters to pagination links
        $opportunities->appends($httpRequest->only(['sort', 'order', 'user', 'title', 'type', 'location', 'closing_date']));

        return Inertia::render('Opportunity/List', [
            'opportunities' => $opportunities,
            'title' => 'Opportunities',
            'banner' => [
                'title' => 'List of Opportunities',
                'description' => 'Browse and view opportunities submitted by CDF partners here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'currentSort' => [
                'field' => $sortField,
                'order' => $sortOrder,
            ],
            'currentSearch' => [
                'user' => $searchUser ?? '',
                'title' => $searchTitle ?? '',
                'type' => $searchType ?? '',
                'location' => $searchLocation ?? '',
                'closing_date' => $searchClosingDate ?? '',
            ],
            'locationData' => [
                'countries' => CountryOptions::getOptions(),
                'regions' => RegionOptions::getOptions(),
                'oceans' => OceanOptions::getOptions(),
                'targetAudiences' => TargetAudienceOptions::getOptions(),
                'opportunityTypes' => OpportunityTypeOptions::getOptions(),
            ],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Opportunities', 'url' => route('opportunity.list')],
            ],
            'pageActions' => [
                "canAddNew" => false,
                "canChangeStatus" => false,
                "canDelete" => false,
                "canEdit" => false,
                "canSubmitNew" => false,
                'canApply' => true,
            ],
        ]);
    }

    public function show(int $id)
    {
        $opportunity = $this->opportunityService->findOpportunity($id, Auth::user());

        if (!$opportunity) {
            abort(404, 'Opportunity not found');
        }

        return Inertia::render('Opportunity/Show', [
            'opportunity' => $opportunity,
            'title' => 'Opportunity Details',
            'banner' => [
                'title' => 'Opportunity Details',
                'description' => 'View the details of the selected opportunity.',
                'image' => '/assets/img/sidebar.png',
            ],
            'locationData' => [
                'countries' => CountryOptions::getOptions(),
                'regions' => RegionOptions::getOptions(),
                'oceans' => OceanOptions::getOptions(),
                'targetAudiences' => TargetAudienceOptions::getOptions(),
                'opportunityTypes' => OpportunityTypeOptions::getOptions(),
            ],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Opportunities', 'url' => route('opportunity.list')],
                ['name' => 'View Opportunity', 'url' => route('opportunity.show', ['id' => $id])],
            ],
        ]);
    }

    public function edit(int $id)
    {
        $opportunity = $this->opportunityService->findOpportunity($id, Auth::user());

        if (!$opportunity) {
            abort(404, 'Opportunity not found');
        }

        return Inertia::render('Opportunity/Create', [
            'title' => 'Edit Opportunity : ' . $opportunity->title,
            'banner' => [
                'title' => 'Edit Opportunity : ' . $opportunity->title,
                'description' => 'Edit my Opportunity details here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'opportunityTypes' => Opportunity::getTypeOptions(),
            'form' => [
                'countries' => CountryOptions::getOptions(),
                'regions' => RegionOptions::getOptions(),
                'oceans' => OceanOptions::getOptions(),
                'targetAudiences' => TargetAudienceOptions::getOptions(),
                'opportunityTypes' => OpportunityTypeOptions::getOptions(),
            ],
            'request' => $opportunity->toArray(),
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Opportunities', 'url' => route('opportunity.list')],
                [
                    'name' => 'Edit Opportunity #' . $opportunity->id,
                    'url' => route('opportunity.edit', ['id' => $opportunity->id])
                ],
            ],
        ]);
    }

    public function updateStatus(Request $request, int $opportunityId)
    {
        try {
            $statusCode = (int)$request->input('status');
            $result = $this->opportunityService->updateOpportunityStatus($opportunityId, $statusCode, $request->user());

            return response()->json([
                'message' => 'Status updated successfully',
                'status' => $result['status']
            ]);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 500;
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    public function destroy(Request $request, int $id)
    {
        try {
            $this->opportunityService->deleteOpportunity($id, $request->user());

            return response()->json(['message' => 'Opportunity deleted successfully']);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 500;
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    public function search(Request $httpRequest)
    {
        $sortField = $httpRequest->get('sort', 'created_at');
        $sortOrder = $httpRequest->get('order', 'desc');
        $searchUser = $httpRequest->get('user');
        $searchTitle = $httpRequest->get('title');
        $searchType = $httpRequest->get('type');
        $searchStatus = $httpRequest->get('status');
        $searchLocation = $httpRequest->get('location');
        $searchClosingDate = $httpRequest->get('closing_date');

        $searchFilters = array_filter([
            'user' => $searchUser,
            'title' => $searchTitle,
            'type' => $searchType,
            'status' => $searchStatus,
            'location' => $searchLocation,
            'closing_date' => $searchClosingDate,
        ]);

        $sortFilters = [
            'field' => $sortField,
            'order' => $sortOrder,
            'per_page' => $httpRequest->get('per_page', 10),
        ];

        // Determine if searching public opportunities or user's own
        $isPublicSearch = $httpRequest->get('public', false);
        
        if ($isPublicSearch) {
            $opportunities = $this->opportunityService->getPublicOpportunitiesPaginated($searchFilters, $sortFilters);
        } else {
            $opportunities = $this->opportunityService->getUserOpportunitiesPaginated($httpRequest->user(), $searchFilters, $sortFilters);
        }

        return response()->json([
            'opportunities' => $opportunities,
            'currentSort' => [
                'field' => $sortField,
                'order' => $sortOrder,
            ],
            'currentSearch' => $searchFilters,
        ]);
    }

    public function stats(Request $request)
    {
        $stats = $this->opportunityService->getOpportunityStats($request->user());

        return response()->json(['stats' => $stats]);
    }
}
