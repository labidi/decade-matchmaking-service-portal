<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Models\Opportunity;
use App\Enums\OpportunityStatus;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class OpportunityController extends Controller
{
    public function list(Request $httpRequest)
    {
        // Fetch all opportunities
        $opportunities = Opportunity::where('status', OpportunityStatus::ACTIVE)->get();

        // Return the opportunities to the view
        return Inertia::render('Opportunity/List', [
            'opportunities' => $opportunities,
            'title' => 'Opportunities',
            'banner' => [
                'title' => 'List of Opportunities',
                'description' => 'Manage your opportunities here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Opportunities', 'url' => route('user.opportunity.list')],
            ],
        ]);
    }


    public function show(Request $httpRequest)
    {
        // Fetch all opportunities
        $opportunities = Opportunity::where('status', OpportunityStatus::ACTIVE)->get();

        // Return the opportunities to the view
        return Inertia::render('Opportunity/List', [
            'opportunities' => $opportunities,
            'title' => 'Opportunities',
            'banner' => [
                'title' => 'List of Opportunities',
                'description' => 'Manage your opportunities here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Opportunities', 'url' => route('user.opportunity.list')],
            ],
        ]);
    }
}
