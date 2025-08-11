<?php

namespace App\Http\Controllers\Opportunities;

use App\Enums\OpportunityStatus;
use App\Enums\OpportunityType;
use App\Models\Opportunity;
use App\Services\OpportunityService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ListController extends BaseOpportunitiesController
{
    public function __construct(private OpportunityService $opportunityService)
    {
    }

    public function __invoke(Request $httpRequest): Response
    {
        $context = $this->getRouteContext();

        return match ($context) {
            'admin' => $this->adminOpportunities($httpRequest),
            'user_own' => $this->myOpportunities($httpRequest),
            'public' => $this->publicOpportunities($httpRequest),
            default => $this->publicOpportunities($httpRequest),
        };
    }

    /**
     * Handle admin opportunities listing
     */
    private function adminOpportunities(Request $httpRequest): Response
    {
        $searchFilters = $this->buildSearchFilters($httpRequest, ['user', 'title', 'type', 'status', 'location', 'closing_date']);
        $sortFilters = $this->buildSortFilters($httpRequest);

        // Admin can see all opportunities - could be implemented later
        $opportunities = $this->opportunityService->getPublicOpportunitiesPaginated($searchFilters, $sortFilters);
        $this->appendPagination($opportunities, $httpRequest, ['sort', 'order', 'user', 'title', 'type', 'status', 'location', 'closing_date']);

        return Inertia::render('Admin/Opportunity/List', [
            'opportunities' => $opportunities,
            'title' => 'Opportunities (Admin)',
            'banner' => $this->buildBanner('Manage Opportunities', 'Admin view of all opportunities in the system.'),
            'searchFieldsOptions' => [
                'types' => Opportunity::getTypeOptions(),
                'statuses' => OpportunityStatus::getOptions(),
            ],
            'currentSort' => [
                'field' => $sortFilters['field'],
                'order' => $sortFilters['order'],
            ],
            'routeName' => 'admin.opportunity.list',
            'currentSearch' => $searchFilters,
            'breadcrumbs' => [
                ['name' => 'Admin', 'url' => route('admin.dashboard.index')],
                ['name' => 'Opportunities', 'url' => route('admin.opportunity.list')],
            ],
            'pageActions' => [
                'canAddNew' => true,
                'canChangeStatus' => true,
                'canDelete' => true,
                'canEdit' => true,
                'canSubmitNew' => true,
                'canApply' => false,
            ],
        ]);
    }

    /**
     * Handle user's own opportunities listing (from OpportunitiesController::mySubmittedList)
     */
    private function myOpportunities(Request $httpRequest): Response
    {
        $searchFilters = $this->buildSearchFilters($httpRequest, ['title', 'type', 'status']);
        $sortFilters = $this->buildSortFilters($httpRequest);

        $opportunities = $this->opportunityService->getUserOpportunitiesPaginated($httpRequest->user(), $searchFilters, $sortFilters);
        $this->appendPagination($opportunities, $httpRequest, ['sort', 'order', 'user', 'title', 'type', 'status', 'location']);

        return Inertia::render('Opportunity/List', [
            'opportunities' => $opportunities,
            'title' => 'Opportunities',
            'routeName' => 'opportunity.me.list',
            'banner' => $this->buildBanner('List of My submitted Opportunities', 'Manage your submitted opportunities here.'),
            'currentSort' => [
                'field' => $sortFilters['field'],
                'order' => $sortFilters['order'],
            ],
            'searchFieldsOptions' => [
                'types' => OpportunityType::getOptions(),
                'statuses' => OpportunityStatus::getOptions(),
            ],
            'currentSearch' => [
                'type' => $searchFilters['type'] ?? '',
                'status' => $searchFilters['status'] ?? '',
            ],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Opportunities', 'url' => route('opportunity.me.list')],
            ],
            'pageActions' => [
                'canAddNew' => true,
                'canChangeStatus' => false,
                'canDelete' => true,
                'canSubmitNew' => true,
                'canApply' => false,
            ],
        ]);
    }

    /**
     * Handle public opportunities listing (original functionality)
     */
    private function publicOpportunities(Request $httpRequest): Response
    {
        $searchFilters = $this->buildSearchFilters($httpRequest, ['title', 'type']);
        $sortFilters = $this->buildSortFilters($httpRequest);

        $opportunities = $this->opportunityService->getPublicOpportunitiesPaginated($searchFilters, $sortFilters);
        $this->appendPagination($opportunities, $httpRequest, ['sort', 'order', 'user', 'title', 'type', 'location', 'closing_date']);

        return Inertia::render('Opportunity/List', [
            'opportunities' => $opportunities,
            'title' => 'Opportunities',
            'banner' => $this->buildBanner('List of Opportunities', 'Browse and view opportunities submitted by CDF partners here.'),
            'searchFieldsOptions' => [
                'types' => OpportunityType::getOptions(),
                'statuses' => OpportunityStatus::getOptions(),
            ],
            'currentSort' => [
                'field' => $sortFilters['field'],
                'order' => $sortFilters['order'],
            ],
            'routeName' => 'opportunity.list',
            'currentSearch' => [
                'title' => $searchFilters['title'] ?? '',
                'type' => $searchFilters['type'] ?? '',
            ],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Opportunities', 'url' => route('opportunity.list')],
            ],
            'pageActions' => [
                'canAddNew' => false,
                'canChangeStatus' => false,
                'canDelete' => false,
                'canEdit' => false,
                'canSubmitNew' => false,
                'canApply' => true,
            ],
        ]);
    }
}
