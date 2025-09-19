<?php

namespace App\Http\Controllers\Opportunities;

use App\Http\Controllers\Traits\HasPageActions;
use App\Http\Resources\OpportunityResource;
use App\Models\Opportunity;
use App\Services\Opportunity\EnhancerService;
use App\Services\OpportunityService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ShowController extends BaseOpportunitiesController
{
    use HasPageActions;

    public function __construct(private readonly OpportunityService $opportunityService)
    {
    }

    /**
     * @throws \Throwable
     */
    public function __invoke(Request $request, int $id): Response
    {
        $opportunity = $this->opportunityService->findOpportunity($id);
        $actions = [];

        if ($this->getRouteContext() === 'user_own' && $request->user()->can('create', Opportunity::class)) {
            $actions[] = $this->createPrimaryAction(
                'Create a new Opportunity',
                route('opportunity.create')
            );
        }

        if($this->getRouteContext() === 'user_own' && $request->user()->can('edit', [Opportunity::class, $opportunity])) {
            $actions[] = $this->createAction(
                'Edit Opportunity',
                route('opportunity.edit', $opportunity->id),
            );
        }
        if($this->getRouteContext() === 'public' && $request->user()->can('apply', [Opportunity::class, $opportunity])) {
            $actions[] = $this->createPrimaryAction(
                'Apply for opportunity',
                $opportunity->url,
                'secondary'
            );
        }

        return Inertia::render('Opportunity/Show', [
            'banner' => $this->buildBanner(
                'List of Opportunities',
                'Browse and view opportunities submitted by CDF partners here.'
            ),
            'opportunity' => $opportunity->toResource(OpportunityResource::class),
            'actions' => $this->buildActions($actions)
        ]);
    }
}
