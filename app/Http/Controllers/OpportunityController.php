<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class OpportunityController extends Controller
{
    
    public function create(){
        return Inertia::render('Request/Create', [
            'title' => 'Create a new request',
            'banner' => [
                'title' => 'Create a new Opportunity',
                'description' => 'Create a new Opportunity to get started.',
                'image' => 'http://portal_dev.local/assets/img/sidebar.png',
            ]
        ]);
    }

    public function store(Request $httpRequest)
    {
        // Validate the request data
        $validatedData = $httpRequest->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'salary' => 'nullable|numeric',
            'company_id' => 'required|exists:companies,id',
        ]);

        // Create a new opportunity
        $opportunity = Opportunity::create($validatedData);

        // Return a response
        return response()->json(['message' => 'Opportunity created successfully', 'opportunity' => $opportunity], 201);
    }
}
