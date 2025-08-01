<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\ExpressInterest;
use App\Models\Data\CountryOptions;
use App\Models\Data\SubThemeOptions;
use App\Models\Data\SupportTypeOptions;
use App\Models\Data\RelatedActivityOptions;
use App\Models\Data\DeliveryFormatOptions;
use App\Models\Data\TargetAudienceOptions;
use App\Models\Request as OCDRequest;
use App\Models\Request\Status;
use App\Models\RequestEnhancer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\RequestService;
use App\Services\UserService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Exception;
use App\Http\Resources\OcdRequestResource;

class RequestsController extends Controller
{
    public function __construct(
        private RequestService $service,
        private UserService $userService
    ) {
    }

    /**
     * Display user's requests list
     */
    public function myRequestsList(Request $httpRequest)
    {
        $sortField = $httpRequest->get('sort', 'created_at');
        $sortOrder = $httpRequest->get('order', 'desc');
        $searchUser = $httpRequest->get('user');
        $searchTitle = $httpRequest->get('title');

        $searchFilters = array_filter([
            'user' => $searchUser,
            'title' => $searchTitle,
        ]);

        $sortFilters = [
            'field' => $sortField,
            'order' => $sortOrder,
            'per_page' => 10,
        ];

        $requests = $this->service->getUserRequests($httpRequest->user(), $searchFilters, $sortFilters);

        // Append query parameters to pagination links
        $requests->appends($httpRequest->only(['sort', 'order', 'user', 'title']));

        return Inertia::render('Request/List', [
            'title' => 'My requests',
            'banner' => [
                'title' => 'List of my requests',
                'description' => 'Manage your requests here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'requests' => $requests,
            'routeName' => 'request.me.list',
            'currentSort' => [
                'field' => $sortField,
                'order' => $sortOrder,
            ],
            'currentSearch' => [
                'user' => $searchUser ?? '',
                'title' => $searchTitle ?? '',
            ],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'My requests', 'url' => route('request.me.list')],
            ],

        ]);
    }

    /**
     * Display public requests list (for partners)
     */
    public function list(Request $httpRequest)
    {
        $sortField = $httpRequest->get('sort', 'created_at');
        $sortOrder = $httpRequest->get('order', 'desc');
        $searchUser = $httpRequest->get('user');
        $searchTitle = $httpRequest->get('title');

        $searchFilters = array_filter([
            'user' => $searchUser,
            'title' => $searchTitle,
        ]);

        $sortFilters = [
            'field' => $sortField,
            'order' => $sortOrder,
            'per_page' => 10,
        ];

        $requests = $this->service->getPublicRequests($searchFilters, $sortFilters);

        return Inertia::render('Request/List', [
            'title' => 'View Request for Training workshops',
            'banner' => [
                'title' => 'View Request for Training workshops',
                'description' => 'View requests for training and workshops.',
                'image' => '/assets/img/sidebar.png',
            ],
            'routeName' => 'request.list',
            'currentSort' => [
                'field' => $sortField,
                'order' => $sortOrder,
            ],
            'requests' => $requests,
            'breadcrumbs' => [
                [
                    'name' => 'Home',
                    'url' => route('user.home')
                ],
                [
                    'name' => 'Requests for Training & workshops',
                    'url' => route('request.list')
                ],
            ],
            'grid.actions' => [
                'canEdit' => false,
                'canDelete' => false,
                'canView' => true,
                'canCreate' => false,
                'canExpressInterest' => true,
                'canPreview' => true,
            ],
        ]);
    }

    /**
     * Display matched requests for user
     */
    public function matchedRequest(Request $httpRequest)
    {
        $sortField = $httpRequest->get('sort', 'created_at');
        $sortOrder = $httpRequest->get('order', 'desc');
        $searchUser = $httpRequest->get('user');
        $searchTitle = $httpRequest->get('title');

        $searchFilters = array_filter([
            'user' => $searchUser,
            'title' => $searchTitle,
        ]);

        $sortFilters = [
            'field' => $sortField,
            'order' => $sortOrder,
            'per_page' => 10,
        ];

        $requests = $this->service->getMatchedRequests($httpRequest->user(), $searchFilters, $sortFilters);

        return Inertia::render('Request/List', [
            'title' => 'View my matched requests',
            'banner' => [
                'title' => 'View my matched requests',
                'description' => 'View and browse my matched Request with CDF partners',
                'image' => '/assets/img/sidebar.png',
            ],
            'routeName' => 'request.me.matched-requests',
            'currentSort' => [
                'field' => $sortField,
                'order' => $sortOrder,
            ],
            'requests' => $requests,
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'My matched Requests', 'url' => route('request.list')],
            ],
            'grid.actions' => [
                'canEdit' => false,
                'canDelete' => false,
                'canView' => true,
                'canCreate' => false,
                'canExpressInterest' => false,
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
            'formOptions' => [
                'subthemes' => SubThemeOptions::getOptions(),
                'support_types' => SupportTypeOptions::getOptions(),
                'related_activity' => RelatedActivityOptions::getOptions(),
                'delivery_format' => DeliveryFormatOptions::getOptions(),
                'target_audience' => TargetAudienceOptions::getOptions(),
                'delivery_countries' => CountryOptions::getOptions()
            ],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Requests', 'url' => route('request.me.list')],
                ['name' => 'Create Request', 'url' => route('request.create')],
            ],
        ]);
    }

    /**
     * Submit request (draft or final)
     */
    public function submit(\App\Http\Requests\StoreOcdRequest $request)
    {
        $requestId = $request->input('id') ?? null;
        $mode = $request->input('mode', 'submit');
        if ($mode == 'draft') {
            return $this->saveRequestAsDraft($request, $requestId);
        }
        return $this->store($request, $requestId);
    }

    /**
     * Save request as draft
     */
    public function saveRequestAsDraft(Request $request, $requestId = null)
    {
        $ocdRequest = $requestId ? OCDRequest::find($requestId) : null;
        if ($requestId && !$ocdRequest) {
            throw new Exception('Request not found');
        }
        $ocdRequest = $this->service->saveDraft($request->user(), $request->all(), $ocdRequest);
        return to_route('request.edit', ['id' => $ocdRequest->id])->with([
            'success' => 'Request draft saved successfully.',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(\App\Http\Requests\StoreOcdRequest $request, $requestId = null)
    {
        $validated = $request->validated();

        try {
            $ocdRequest = $requestId ? OCDRequest::find($requestId) : null;
            if ($requestId && !$ocdRequest) {
                throw new Exception('Request not found');
            }
            $ocdRequest = $this->service->storeRequest($request->user(), $validated, $ocdRequest);
            return to_route('request.me.list');
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update request status
     */
    public function updateStatus(Request $request, int $requestId)
    {
        try {
            $statusCode = $request->input('status');
            $result = $this->service->updateRequestStatus($requestId, $statusCode, $request->user());

            return response()->json([
                'message' => 'Status updated successfully',
                'status' => $result['request']->status
            ]);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 500;
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, int $requestId)
    {
        $ocdRequest = $this->service->findRequest($requestId, $request->user(), true);

        if (!$ocdRequest) {
            abort(404, 'Request not found');
        }

        $actions = $this->service->getRequestActions($ocdRequest, $request->user());
        return Inertia::render('Request/Show', [
            'title' => 'Request : ' . $this->service->getRequestTitle($ocdRequest),
            'banner' => [
                'title' => 'Request : ' . $this->service->getRequestTitle($ocdRequest),
                'description' => 'View my request details here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'request' => RequestEnhancer::enhanceRequest($ocdRequest),
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Requests', 'url' => route('request.me.list')],
                [
                    'name' => 'View Request #' . $ocdRequest->id,
                    'url' => route('request.show', ['id' => $ocdRequest->id])
                ],
            ],
            'requestDetail.actions' => $actions,
        ]);
    }

    /**
     * Display request preview
     */
    public function preview(Request $request, int $requestId)
    {
        $ocdRequest = $this->service->findRequest($requestId, $request->user());

        if (!$ocdRequest) {
            abort(404, 'Request not found');
        }

        $offer = $this->service->getActiveOffer($requestId);

        return Inertia::render('Request/Preview', [
            'title' => 'Request : ' . $this->service->getRequestTitle($ocdRequest),
            'banner' => [
                'title' => 'Request : ' . $this->service->getRequestTitle($ocdRequest),
                'description' => 'View my request details here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'request' => $ocdRequest,
            'offer' => $offer,
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Requests', 'url' => route('request.me.list')],
                [
                    'name' => 'View Request #' . $ocdRequest->id,
                    'url' => route('request.show', ['id' => $ocdRequest->id])
                ],
            ],
            'requestDetail.actions' => [
                'canEdit' => false,
                'canDelete' => false,
                'canCreate' => false,
                'canExpressInterest' => false,
                'canExportPdf' => false,
                'canAcceptOffer' => false,
                'canRequestClarificationForOffer' => false
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $requestId)
    {
        $ocdRequest = $this->service->findRequest($requestId, Auth::user());

        if (!$ocdRequest) {
            abort(404, 'Request not found');
        }

        return Inertia::render('Request/Create', [
            'title' => 'Request : ' . $this->service->getRequestTitle($ocdRequest),
            'banner' => [
                'title' => 'Request : ' . $this->service->getRequestTitle($ocdRequest),
                'description' => 'Edit my request details here.',
                'image' => '/assets/img/sidebar.png',
            ],
            'request' => $ocdRequest->toArray(),
            'formOptions' => [
                'subthemes' => SubThemeOptions::getOptions(),
                'support_types' => SupportTypeOptions::getOptions(),
                'related_activity' => RelatedActivityOptions::getOptions(),
                'delivery_format' => DeliveryFormatOptions::getOptions(),
                'target_audience' => TargetAudienceOptions::getOptions(),
                'delivery_countries' => CountryOptions::getOptions()
            ],
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('user.home')],
                ['name' => 'Requests', 'url' => route('request.me.list')],
                [
                    'name' => 'Edit Request #' . $ocdRequest->id,
                    'url' => route('request.edit', ['id' => $ocdRequest->id])
                ],
            ],
        ]);
    }

    /**
     * Export request as PDF
     */
    public function exportPdf(int $requestId)
    {
        $ocdRequest = $this->service->getRequestForExport($requestId, Auth::user());

        if (!$ocdRequest) {
            return redirect()->back()->with('error', 'Request not found or access denied');
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
        try {
            $requestId = (int)$request->route('id');
            $this->service->deleteRequest($requestId, $request->user());

            return response()->json(['message' => 'Request deleted successfully']);
        } catch (Exception $e) {
            $statusCode = $e->getCode() ?: 500;
            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * Get request statistics
     */
    public function stats(Request $request)
    {
        $stats = $this->service->getRequestStats($request->user());

        return response()->json(['stats' => $stats]);
    }

    /**
     * Express interest in a request
     */
    public function expressInterest(Request $request, int $requestId)
    {
        try {
            $ocdRequest = OCDRequest::findOrFail($requestId);
            $interestedUser = $request->user();

            // Get admin recipients using UserService
            $admins = $this->userService->getAllAdmins();

            // Send emails to admins
            foreach ($admins as $admin) {
                $recipient = [
                    'email' => $admin->email,
                    'name' => $admin->name,
                    'type' => 'admin'
                ];

                Mail::to($recipient['email'])
                    ->send(new ExpressInterest($ocdRequest, $interestedUser, $recipient));
            }

            // Log the activity
            \Illuminate\Support\Facades\Log::info('Express interest emails sent', [
                'request_id' => $requestId,
                'interested_user_id' => $interestedUser->id,
                'admin_count' => $admins->count()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Your interest has been expressed successfully. The CDF Secretariat will follow up within three business days.'
            ]);
        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to express interest', [
                'request_id' => $requestId,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to express interest. Please try again.'
            ], 500);
        }
    }
}
