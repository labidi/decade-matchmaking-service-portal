<?php

namespace App\Http\Controllers\Opportunities;

use App\Enums\Country;
use App\Enums\Ocean;
use App\Enums\OpportunityType;
use App\Enums\Region;
use App\Enums\TargetAudience;
use App\Enums\YesNo;
use Inertia\Inertia;
use Inertia\Response;

class FormController extends BaseOpportunitiesController
{
    public function __invoke(): Response
    {
        return Inertia::render('Opportunity/Create', [
            'title' => 'Create a new request',
            'banner' => $this->buildBanner('Create a new Opportunity', 'Create a new Opportunity to get started.'),
            'formOptions' => [
                'countries' => Country::getOptions(),
                'regions' => Region::getOptions(),
                'oceans' => Ocean::getOptions(),
                'target_audience' => TargetAudience::getOptions(),
                'opportunity_types' => OpportunityType::getOptions(),
                'yes_no' => YesNo::getOptions(),
            ],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Opportunities', 'url' => route('opportunity.me.list')],
                ['name' => 'Create Opportunity', 'url' => route('opportunity.create')],
            ],
        ]);
    }
}
