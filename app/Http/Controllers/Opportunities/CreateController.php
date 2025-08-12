<?php

namespace App\Http\Controllers\Opportunities;

use Inertia\Inertia;
use Inertia\Response;

class CreateController extends BaseOpportunitiesController
{
    public function __invoke(): Response
    {
        return Inertia::render('Opportunity/Create', [
            'title' => 'Create a new request',
            'banner' => $this->buildBanner('Create a new Opportunity', 'Create a new Opportunity to get started.'),
            'formOptions' => $this->formOptions(),
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Opportunities', 'url' => route('opportunity.me.list')],
                ['name' => 'Create Opportunity', 'url' => route('opportunity.create')],
            ],
        ]);
    }
} 