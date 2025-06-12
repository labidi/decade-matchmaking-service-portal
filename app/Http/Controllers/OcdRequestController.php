<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Request as OCDRequest;
use App\Models\Request\RequestStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Request\RequestOffer;
use App\Enums\RequestOfferStatus;
use App\Services\OcdRequestService;
use Barryvdh\DomPDF\Facade\Pdf;

class OcdRequestController extends Controller
{
    public function __construct(private OcdRequestService $service)
    {
    }


    /**
     * Display a listing of the resource.
     */
    public function myRequestsList(Request $httpRequest)
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
                ['name' => 'Requests', 'url' => route('user.request.myrequests')],
            ],
            'grid.actions' => [
                'canEdit' => true,
                'canDelete' => true,
                'canView' => true,
                'canCreate' => true,
            ],
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function list(Request $httpRequest)
    {
        $request = OCDRequest::with('status')->whereHas(
            'status',
            function (Builder $query) {
                $query->where('status_code', 'validated');
                $query->orWhere('status_code', 'offer_made');
                $query->orWhere('status_code', 'match_made');
                $query->orWhere('status_code', 'closed');
            }
        )->get();
        return Inertia::render('Request/List', [
            'title' => 'View Request for Training workshops',
            'banner' => [
                'title' => 'View Request for Training workshops',
                'description' => 'View requests for training and workshops.',
                'image' => '/assets/img/sidebar.png',
            ],
            'requests' => $request,
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Requests', 'url' => route('partner.request.list')],
            ],
            'grid.actions' => [
                'canEdit' => false,
                'canDelete' => false,
                'canView' => true,
                'canCreate' => false,
                'canExpressInterrest' => true
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
                ['name' => 'Requests', 'url' => route('user.request.myrequests')],
                ['name' => 'Create Request', 'url' => route('user.request.create')],
            ],
        ]);
    }

    public function submit(\App\Http\Requests\StoreOcdRequest $httpRequest)
    {
        $requestId = $httpRequest->input('id') ?? null;
        $mode = $httpRequest->input('mode', 'submit');
        if ($mode == 'draft') {
            return $this->saveRequestAsDraft($httpRequest, $requestId);
        }
        return $this->store($httpRequest, $requestId);
    }

    public function saveRequestAsDraft(Request $httpRequest, $requestId = null)
    {
        try {
            $ocdRequest = $requestId ? OCDRequest::find($requestId) : null;
            if ($requestId && ! $ocdRequest) {
                throw new \Exception('Request not found');
            }
            $ocdRequest = $this->service->saveDraft($httpRequest->user(), $httpRequest->all(), $ocdRequest);
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
    public function store(\App\Http\Requests\StoreOcdRequest $httpRequest, $requestId = null)
    {
        $validated = $httpRequest->validated();
        try {
            $ocdRequest = $requestId ? OCDRequest::find($requestId) : null;
            if ($requestId && ! $ocdRequest) {
                throw new \Exception('Request not found');
            }
            $ocdRequest = $this->service->storeRequest($httpRequest->user(), $validated, $ocdRequest);
            return response()->json([
                'message' => 'Request submitted successfully',
                'request_data' => $ocdRequest->attributesToArray()
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $httpRequest, int $requestId)
    {
        $statusCode = $httpRequest->input('status');
        $ocdRequest = OCDRequest::find($requestId);
        if (!$ocdRequest) {
            return response()->json(['error' => 'Request not found'], 404);
        }
        $status = RequestStatus::where('status_code', $statusCode)->first();
        if (!$status) {
            return response()->json(['error' => 'Status not found'], 422);
        }
        $ocdRequest->status()->associate($status);
        $ocdRequest->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'status' => $status->only(['status_code', 'status_label'])
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $httpRequest, int $OCDrequestId)
    {
        $ocdRequest = OCDRequest::with(['status', 'user','offer'])->find($OCDrequestId);
        if (!$ocdRequest) {
            return response()->json(['error' => 'Ocd Request not found'], 404);
        }

        $documents = \App\Models\Document::where('parent_type', RequestOffer::class)
            ->where('parent_id', $OCDrequestId)
            ->get();

        $offer = RequestOffer::with('documents')
            ->where('request_id', $OCDrequestId)
            ->where('status', RequestOfferStatus::ACTIVE)
            ->first();
        return Inertia::render('Request/Show', [
            'title' => 'Request : ' . $ocdRequest->request_data?->capacity_development_title ?? 'N/A',
            'banner' => [
                'title' => 'Request : ' . $ocdRequest->request_data?->capacity_development_title ?? 'N/A',
                'description' => 'View my request details here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'request' => $ocdRequest->toArray(),
            'offer'=>$offer,
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Requests', 'url' => route('user.request.myrequests')],
                ['name' => 'View Request #' . $ocdRequest->id, 'url' => route('user.request.show', ['id' => $ocdRequest->id])],
            ],
            'requestDetail.actions' => [
                'canEdit' => $ocdRequest->user->id === $httpRequest->user()->id && $ocdRequest->status->status_code === "draft",
                'canDelete' => $ocdRequest->user->id === $httpRequest->user()->id && $ocdRequest->status->status_code === "draft",
                'canCreate' => false,
                'canExpressInterrest' => $ocdRequest->user->id !== $httpRequest->user()->id,
                'canExportPdf' => true,
                'canAcceptOffer'=>$offer &&  $ocdRequest->user->id == $httpRequest->user()->id,
                'canRequestClarificationForOffer'=>$offer &&  $ocdRequest->user->id == $httpRequest->user()->id
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
            'title' => 'Request : ' . $ocdRequest->request_data?->capacity_development_title ?? 'N/A',
            'banner' => [
                'title' => 'Request : ' . $ocdRequest->request_data?->capacity_development_title ?? 'N/A',
                'description' => 'Edit my request details here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'request' => $ocdRequest->toArray(),
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('dashboard')],
                ['name' => 'Requests', 'url' => route('user.request.myrequests')],
                ['name' => 'Edit Request #' . $ocdRequest->id, 'url' => route('user.request.edit', ['id' => $ocdRequest->id])],
            ],
        ]);
    }

    public function exportPdf(int $OCDrequestId)
    {
        $ocdRequest = OCDRequest::with(['status', 'user'])->find($OCDrequestId);
        if (!$ocdRequest) {
            return redirect()->back()->with('error', 'Ocd Request not found');
        }

        $pdf = Pdf::loadView('pdf.ocdrequest', [
            'ocdRequest' => $ocdRequest,
        ]);

        return $pdf->download('request_' . $ocdRequest->id . '.pdf');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $ocdRequestId = (int) $request->route('id');
        $ocdRequest = OCDRequest::with('status')->find($ocdRequestId);

        if (!$ocdRequest) {
            return response()->json(['error' => 'Request not found'], 404);
        }

        if ($ocdRequest->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($ocdRequest->status->status_code !== 'draft') {
            return response()->json(['error' => 'Only draft requests can be deleted'], 422);
        }

        $ocdRequest->delete();

        return response()->json(['message' => 'Request deleted successfully']);
    }
}
