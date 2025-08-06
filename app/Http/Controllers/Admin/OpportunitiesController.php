<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Opportunity;
use App\Traits\HasBreadcrumbs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OpportunitiesController extends Controller
{
    use HasBreadcrumbs;
    public function list(Request $httpRequest): Response
    {
        $sortField = $httpRequest->get('sort', 'created_at');
        $sortOrder = $httpRequest->get('order', 'desc');
        $searchUser = $httpRequest->get('user');
        $searchTitle = $httpRequest->get('title');

        // Validate sort order
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'desc';

        $opportunitiesQuery = Opportunity::with(['user'])  ;

        // Apply search filters
        if ($searchUser) {
            $opportunitiesQuery->whereHas('user', function ($q) use ($searchUser) {
                $q->where('name', 'like', '%' . $searchUser . '%');
            });
        }
        if ($searchTitle) {
            $opportunitiesQuery->where('title', 'like', '%' . $searchTitle . '%');
        }
        $opportunities = $opportunitiesQuery->orderBy($sortField, $sortOrder)
            ->paginate(5)
            ->appends($httpRequest->only(['sort', 'order']));

        return Inertia::render('Admin/Opportunity/List', [
            'title' => 'Opportunities',
            'opportunities' => $opportunities,
            'currentSort' => [
                'field' => $sortField,
                'order' => $sortOrder,
            ],
            'currentSearch' => [
                'user' => $searchUser ?? '',
                'title' => $searchTitle ?? '',
            ],
            'routeName' => 'admin.opportunity.list',
            'breadcrumbs' => $this->buildOpportunityBreadcrumbs('list', null, true),
        ]);
    }
}
