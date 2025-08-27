<?php

namespace App\Http\Controllers\Opportunities;

use App\Enums\Common\Country;
use App\Enums\Common\Ocean;
use App\Enums\Common\Region;
use App\Enums\Common\TargetAudience;
use App\Enums\Common\YesNo;
use App\Enums\Opportunity\Type;
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
                'opportunity_types' => Type::getOptions(),
                'yes_no' => YesNo::getOptions(),
            ]
        ]);
    }
}
