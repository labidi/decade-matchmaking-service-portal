<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OpportunityController extends Controller
{
    public function list(Request $request): Response
    {
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');

        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['title', 'type', 'closing_date', 'status', 'created_at'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        // Validate sort order
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'desc';

        $opportunities = Opportunity::with(['user'])
            ->orderBy($sortField, $sortOrder)
            ->paginate(10)
            ->appends($request->only(['sort', 'order']));

        return Inertia::render('Admin/Opportunity/List', [
            'title' => 'Opportunities',
            'opportunities' => $opportunities,
            'currentSort' => [
                'field' => $sortField,
                'order' => $sortOrder,
            ],
        ]);
    }
}
