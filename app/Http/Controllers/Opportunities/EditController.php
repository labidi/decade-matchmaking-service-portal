<?php

namespace App\Http\Controllers\Opportunities;

use App\Http\Controllers\Controller;
use App\Enums\Country;
use App\Enums\Ocean;
use App\Enums\OpportunityType;
use App\Enums\Region;
use App\Enums\TargetAudience;
use App\Enums\YesNo;
use App\Services\OpportunityService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EditController extends Controller
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

        return Inertia::render('Opportunity/Create', [
            'title' => 'Edit Opportunity : ' . $opportunity->title,
            'banner' => [
                'title' => 'Edit Opportunity : ' . $opportunity->title,
                'description' => 'Edit my Opportunity details here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'opportunityTypes' => $opportunity->getTypeOptions(),
            'formOptions' => [
                'countries' => Country::getOptions(),
                'regions' => Region::getOptions(),
                'oceans' => Ocean::getOptions(),
                'targetAudiences' => TargetAudience::getOptions(),
                'opportunityTypes' => OpportunityType::getOptions(),
                'yes_no' => YesNo::getOptions(),
                'yes_no_lowercase' => YesNo::getOptionsLowercase(),
            ],
            'opportunity' => $opportunity->toArray(),
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Opportunities', 'url' => route('opportunity.me.list')],
                [
                    'name' => 'Edit Opportunity #' . $opportunity->id,
                    'url' => route('opportunity.edit', ['id' => $opportunity->id])
                ],
            ],
        ]);
    }
} 