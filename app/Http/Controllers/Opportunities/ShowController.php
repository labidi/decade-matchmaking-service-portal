<?php

namespace App\Http\Controllers\Opportunities;

use App\Services\OpportunityService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ShowController extends BaseOpportunitiesController
{
    public function __construct(private OpportunityService $opportunityService)
    {
    }

    public function __invoke(int $id): Response
    {
        $opportunity = $this->opportunityService->findOpportunity($id, Auth::user());

        if (!$opportunity) {
            abort(404, 'Opportunity not found');
        }

        return Inertia::render('Opportunity/Show', [
            'banner' => $this->buildBanner('List of Opportunities', 'Browse and view opportunities submitted by CDF partners here.'),
            'opportunity' => $opportunity,
            'title' => $opportunity->title,
            'userPermissions' => $this->userPermissions($opportunity, Auth::user()),
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Opportunities', 'url' => route('opportunity.me.list')],
                ['name' => $opportunity->title],
            ],
        ]);
    }
} 