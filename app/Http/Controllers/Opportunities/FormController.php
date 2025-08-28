<?php

namespace App\Http\Controllers\Opportunities;

use App\Enums\Common\Country;
use App\Enums\Common\Ocean;
use App\Enums\Common\Region;
use App\Enums\Common\TargetAudience;
use App\Enums\Common\YesNo;
use App\Enums\Opportunity\CoverageActivity;
use App\Enums\Opportunity\Type;
use App\Http\Requests\OpportunityPostRequest;
use App\Services\OpportunityService;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class FormController extends BaseOpportunitiesController
{
    public function __construct(private readonly OpportunityService $opportunityService)
    {
    }

    public function form(): Response
    {
        return Inertia::render('Opportunity/Create', [
            'title' => 'Create a new Opportunity',
            'banner' => $this->buildBanner('Create a new Opportunity', 'Create a new Opportunity to get started.'),
            'formOptions' => [
                'countries' => Country::getOptions(),
                'regions' => Region::getOptions(),
                'oceans' => Ocean::getOptions(),
                'target_audience' => TargetAudience::getOptions(),
                'opportunity_types' => Type::getOptions(),
                'coverage_activity' => CoverageActivity::getOptions(),
                'yes_no' => YesNo::getOptions(),
            ]
        ]);
    }

    public function store(OpportunityPostRequest $request)
    {
        $validatedData = $request->validated();
        try {
            $this->opportunityService->createOpportunity($validatedData, $request->user());
            return to_route('opportunity.me.list')->with('success', 'Opportunity submitted successfully');
        } catch (Throwable) {
            return to_route('opportunity.me.list')->with('error', 'Error while submitting Opportunity');
        }
    }

}
