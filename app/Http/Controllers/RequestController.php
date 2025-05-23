<?php

namespace App\Http\Controllers;

use App\Models\Request as OCDRequest;
use Illuminate\Http\Request;
use App\Models\Request\RequestStatus;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;



class RequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Display a listing of the resource.
     */
    public function list()
    {
        return Inertia::render('Request/List', [
            'title' => 'My requests',
            'banner' => [
                'title' => 'List of my requests',
                'description' => 'Manager your requests here.',
                'image' => 'http://portal_dev.local/assets/img/sidebar.png',
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Request/Create', [
            'title' => 'Create a new request',
            'banner' => [
                'title' => 'Create a new request',
                'description' => 'Create a new request to get started.',
                'image' => 'http://portal_dev.local/assets/img/sidebar.png',
            ]
        ]);
    }

    public function submit(Request $httpRequest, $mode = 'submit')
    {
        if ($mode == 'draft') {
            return $this->saveRequestAsDraft($httpRequest);
        }
        return $this->store($httpRequest);
    }

    public function saveRequestAsDraft(Request $httpRequest)
    {
        try {
            $request = $httpRequest->all();
            $ocdRequest = new OCDRequest([
                'request_data' => json_encode($httpRequest->all())
            ]);
            $ocdRequest->status()->associate(RequestStatus::getDraftStatus());
            $ocdRequest->user()->associate($httpRequest->user());
            $ocdRequest->save();
            return response()->json([
                'message' => 'Draft saved successfully',
                'request_data' => $ocdRequest->attributesToArray()
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|max:500',
        ]);

        $ocdRequest = OCDRequest::create($request->all());
        return response()->json([
            'message' => 'Draft saved successfully',
            'request_data' => $ocdRequest->attributesToArray()
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request)
    {
        //
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        //
    }
}
