<?php

namespace App\Http\Controllers\Opportunities;

use App\Enums\Opportunity\Status;
use App\Enums\Opportunity\Type;
use App\Models\Opportunity;
use App\Services\OpportunityService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ListController extends BaseOpportunitiesController
{
    public function __construct(private readonly OpportunityService $opportunityService)
    {
    }

    /**
     * Get context-specific configuration
     */
    private function getContextConfiguration(string $context): array
    {
        return match ($context) {
            'admin' => [
                'component' => 'Admin/Opportunity/List',
                'title' => 'Opportunities',
                'searchFields' => ['user', 'title'],
                'searchFieldsOptions' => [
                    'types' => Opportunity::getTypeOptions(),
                    'statuses' => Status::getOptions(),
                ],
                'currentSearchFields' => ['user', 'title'],
                'routeName' => 'admin.opportunity.list',
            ],
            'user_own' => [
                'component' => 'Opportunity/List',
                'title' => 'Opportunities',
                'banner' => [
                    'title' => 'List of My submitted Opportunities',
                    'description' => 'Manage your submitted opportunities here.'
                ],
                'searchFields' => ['title', 'type', 'status'],
                'searchFieldsOptions' => [
                    'types' => Type::getOptions(),
                    'statuses' => Status::getOptions(),
                ],
                'currentSearchFields' => ['type', 'status','title'],
                'routeName' => 'opportunity.me.list',
                'pageActions'=> [
                    'canSubmitNew'=> true,
                ]
            ],
            'public' => [
                'component' => 'Opportunity/List',
                'title' => 'Opportunities',
                'banner' => [
                    'title' => 'List of Opportunities',
                    'description' => 'Browse and view opportunities submitted by CDF partners here.'
                ],
                'searchFields' => ['title', 'type'],
                'searchFieldsOptions' => [
                    'types' => Type::getOptions(),
                    'statuses' => Status::getOptions(),
                ],
                'currentSearchFields' => ['title', 'type'],
                'routeName' => 'opportunity.list',
            ],
        };
    }

    /**
     * Get opportunities based on context
     */
    private function getOpportunitiesForContext(string $context, $user, array $searchFilters, array $sortFilters)
    {
        return match ($context) {
            'admin' => $this->opportunityService->getAllOpportunitiesPaginated($searchFilters, $sortFilters),
            'user_own' => $this->opportunityService->getUserOpportunitiesPaginated($user, $searchFilters, $sortFilters),
            'public' => $this->opportunityService->getActiveOpportunitiesPaginated($searchFilters, $sortFilters),
            default => $this->opportunityService->getActiveOpportunitiesPaginated($searchFilters, $sortFilters),
        };
    }

    /**
     * Build current search array based on context
     */
    private function buildCurrentSearch(array $searchFilters, array $fields): array
    {
        $currentSearch = [];
        foreach ($fields as $field) {
            $currentSearch[$field] = $searchFilters[$field] ?? '';
        }
        return $currentSearch;
    }

    public function __invoke(Request $httpRequest): Response
    {
        $context = $this->getRouteContext();
        $config = $this->getContextConfiguration($context);

        $searchFilters = $this->buildSearchFilters($httpRequest, $config['searchFields']);
        $sortFilters = $this->buildSortFilters($httpRequest);

        // Call appropriate service method based on context
        $opportunities = $this->getOpportunitiesForContext(
            $context,
            $httpRequest->user(),
            $searchFilters,
            $sortFilters
        );

        return Inertia::render($config['component'], [
            'opportunities' => $opportunities,
            'title' => $config['title'],
            'banner' => isset($config['banner']) ? $this->buildBanner(
                $config['banner']['title'],
                $config['banner']['description']
            ) : null,
            'searchFieldsOptions' => $config['searchFieldsOptions'],
            'currentSort' => [
                'field' => $sortFilters['field'],
                'order' => $sortFilters['order'],
            ],
            'routeName' => $config['routeName'],
            'currentSearch' => $this->buildCurrentSearch($searchFilters, $config['currentSearchFields']),
            'pageActions'=> $config['pageActions'] ?? []
        ]);
    }

}
