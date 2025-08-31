<?php

namespace App\Http\Controllers\Opportunities;

use App\Enums\Common\Country;
use App\Enums\Common\Language;
use App\Enums\Common\Ocean;
use App\Enums\Common\Region;
use App\Enums\Common\TargetAudience;
use App\Enums\Common\YesNo;
use App\Enums\Opportunity\CoverageActivity;
use App\Enums\Opportunity\Type;
use App\Http\Requests\OpportunityPostRequest;
use App\Http\Resources\OpportunityResource;
use App\Services\OpportunityService;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class FormController extends BaseOpportunitiesController
{
    public function __construct(private readonly OpportunityService $opportunityService)
    {
    }

    /**
     * @throws Throwable
     */
    public function form(?int $id = null): Response
    {
        $pageProps = [];
        if ($id) {
            $opportunity = $this->opportunityService->findOpportunity($id);
            $pageProps['title'] = 'Edit Opportunity: ' . $opportunity->title;
            $pageProps['banner'] = $this->buildBanner('Edit Opportunity', 'Edit the details of your opportunity.');
            $pageProps['opportunity'] = $opportunity->toResource(OpportunityResource::class);
        } else {
            $pageProps['title'] = 'Create a new Opportunity';
            $pageProps['banner'] = $this->buildBanner(
                'Create a new Opportunity',
                'Create a new Opportunity to get started.'
            );
        }
        $pageProps['formOptions'] = [
            'countries' => Country::getOptions(),
            'regions' => Region::getOptions(),
            'oceans' => Ocean::getOptions(),
            'target_audience' => TargetAudience::getOptions(),
            'opportunity_types' => Type::getOptions(),
            'coverage_activity' => CoverageActivity::getOptions(),
            'target_languages' => Language::getOptions(),
            'yes_no' => YesNo::getOptions(),
        ];

        return Inertia::render('Opportunity/Create', $pageProps);
    }

    public function store(OpportunityPostRequest $request, ?int $id = null): \Illuminate\Http\RedirectResponse
    {
        $validatedData = $request->validated();
        try {
            if($id) {
                $this->opportunityService->updateOpportunity($id, $validatedData, $request->user());
                return to_route('opportunity.me.list')->with('success', 'Opportunity updated successfully');
            }else {
                $this->opportunityService->createOpportunity($validatedData, $request->user());
                return to_route('opportunity.me.list')->with('success', 'Opportunity submitted successfully');
            }
        } catch (Throwable $e) {
            return back()->with(
                'error',
                'An error occurred while submitting the opportunity. Please try again. :' . $e->getMessage()
            );
        }
    }

}
