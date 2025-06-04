<?php

namespace App\Http\Controllers\User;

use App\Models\Request as OCDRequest;
use Illuminate\Http\Request;
use App\Models\Request\RequestStatus;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;


class RequestController extends Controller
{


    /**
     * Display a listing of the resource.
     */
    public function list(Request $httpRequest)
    {
        return Inertia::render('Request/List', [
            'title' => 'My requests',
            'banner' => [
                'title' => 'List of my requests',
                'description' => 'Manager your requests here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'requests' => OCDRequest::with('status')->where('user_id', $httpRequest->user()->id)->get(),
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Requests', 'url' => route('user.request.list')],
            ],
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
                'image' => '/assets/img/sidebar.png',
            ],
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Requests', 'url' => route('user.request.list')],
                ['name' => 'Create Request', 'url' => route('user.request.create')],
            ],
        ]);
    }

    public function submit(Request $httpRequest, $mode = 'submit')
    {
        $requestId = $httpRequest->input('id') ?? null;
        if ($mode == 'draft') {
            return $this->saveRequestAsDraft($httpRequest, $requestId);
        }
        return $this->store($httpRequest, $requestId);
    }

    public function saveRequestAsDraft(Request $httpRequest, $requestId = null)
    {
        try {
            if ($requestId) {
                $ocdRequest = OCDRequest::find($requestId);
                if (!$ocdRequest) {
                    throw new \Exception('Request not found');
                }
            } else {
                $ocdRequest = new OCDRequest();
                $ocdRequest->status()->associate(RequestStatus::getDraftStatus());
                $ocdRequest->user()->associate($httpRequest->user());
            }
            $ocdRequest->request_data = json_encode($httpRequest->all());
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
    public function store(Request $httpRequest, $requestId = null)
    {
        try {
            if ($requestId) {
                $ocdRequest = OCDRequest::find($requestId);
                if (!$ocdRequest) {
                    throw new \Exception('Request not found');
                }
            } else {
                $ocdRequest = new OCDRequest();
                $ocdRequest->user()->associate($httpRequest->user());
            }
            $ocdRequest->request_data = json_encode($httpRequest->all());
            $ocdRequest->status()->associate(RequestStatus::getUnderReviewStatus());
            $ocdRequest->save();
            return response()->json([
                'message' => 'Request submitted successfully',
                'request_data' => $ocdRequest->attributesToArray()
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $OCDrequestId)
    {
        $ocdRequest = OCDRequest::with('status')->find($OCDrequestId);  
        if (!$ocdRequest) {
            return response()->json(['error' => 'Ocd Request not found'], 404);
        }

        return Inertia::render('Request/Show', [
            'title' => 'Request #'.$OCDrequestId,
            'banner' => [
                'title' => 'Request #'.$OCDrequestId,
                'description' => 'View my request details here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'request'=> $ocdRequest->toArray(),
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Requests', 'url' => route('user.request.list')],
                ['name' => 'View Request #'.$ocdRequest->id, 'url' => route('partner.opportunity.show', ['id' => $ocdRequest->id])],
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $OCDrequestId)
    {
        $ocdRequest = OCDRequest::find($OCDrequestId);
        if (!$ocdRequest) {
            return response()->json(['error' => 'Ocd Request not found'], 404);
        }

        return Inertia::render('Request/Create', [
            'title' => 'Create a new request',
            'banner' => [
                'title' => 'Create a new request',
                'description' => 'Create a new request to get started.',
                'image' => '/assets/img/sidebar.png',
            ],
            'request'=> $ocdRequest->toArray(),
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Requests', 'url' => route('user.request.list')],
                ['name' => 'Edit Request #'.$ocdRequest->id, 'url' => route('user.request.edit', ['id' => $ocdRequest->id])],
            ],
        ]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        //
    }
}
