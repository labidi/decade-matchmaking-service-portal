<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\OfferService;
use App\Services\RequestService;
use App\Models\User;
use App\Traits\HasBreadcrumbs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OffersController extends Controller
{
    use HasBreadcrumbs;

    public function __construct(
        private readonly OfferService $offerService,
        private readonly RequestService $requestService
    ) {
    }

    /**
     * Display paginated list of offers
     */
    public function list(Request $request): Response
    {
        $searchFilters = [
            'description' => $request->get('description'),
            'partner' => $request->get('partner'),
            'request' => $request->get('request'),
        ];

        $sortFilters = [
            'sort' => $request->get('sort', 'created_at'),
            'order' => $request->get('order', 'desc'),
            'per_page' => $request->get('per_page', 10),
        ];

        $offers = $this->offerService->getPaginatedOffers($searchFilters, $sortFilters);

        return Inertia::render('Admin/Offers/List', [
            'offers' => $offers,
            'currentSort' => [
                'field' => $sortFilters['sort'],
                'order' => $sortFilters['order'],
            ],
            'currentSearch' => array_filter($searchFilters),
            'routeName' => 'admin.offers.list',
            'breadcrumbs' => [
                ['name' => 'Dashboard', 'url' => route('admin.dashboard.index')],
                ['name' => 'Manage offers', 'url' => route('admin.offers.list')],
            ]
        ]);
    }

    /**
     * Show form to create new offer
     */
    public function create(Request $request): Response
    {
        $requestId = $request->get('request_id');
        $selectedRequest = null;

        if ($requestId) {
            try {
                $selectedRequest = $this->requestService->getRequestById($requestId, auth()->user());
            } catch (\Exception $e) {
                // Request not found or unauthorized
            }
        }

        // Get available partners (users with partner role or administrator role)
        $partners = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['partner', 'administrator']);
        })
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        // Get available requests that can receive offers
        $availableRequests = $this->requestService->getPublicRequests([], ['per_page' => 100]);

        return Inertia::render('Admin/Offers/Create', [
            'selectedRequest' => $selectedRequest,
            'partners' => $partners,
            'availableRequests' => $availableRequests->items(),
        ]);
    }

    /**
     * Store new offer
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_id' => 'required|exists:requests,id',
            'partner_id' => 'required|exists:users,id',
            'description' => 'required|string|min:10',
            'document' => 'nullable|file|mimes:pdf|max:10240', // 10MB max
        ]);

        try {
            $offer = $this->offerService->createOffer($validated, auth()->user());

            return redirect()
                ->route('admin.offers.show', $offer->id)
                ->with('success', 'Offer created successfully');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Show specific offer
     */
    public function show(int $id): Response
    {
        try {
            $offer = $this->offerService->getOfferById($id, auth()->user());
            return Inertia::render('Admin/Offers/Show', [
                'offer' => $offer,
                'breadcrumbs' => [
                    ['name' => 'Dashboard', 'url' => route('admin.dashboard.index')],
                    ['name' => 'Manage offers', 'url' => route('admin.offers.list')],
                    ['name' => 'Offer #'.$offer->id, 'url' => route('admin.offers.list')],
                ]
            ]);
        } catch (\Exception $e) {
            abort(404, $e->getMessage());
        }
    }

    /**
     * Show form to edit offer
     */
    public function edit(int $id): Response
    {
        try {
            $offer = $this->offerService->getOfferById($id, auth()->user());

            if (!$offer->can_edit) {
                abort(403, 'Unauthorized to edit this offer');
            }

            // Get available partners (users with partner role or administrator role)
            $partners = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['partner', 'administrator']);
            })
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get();

            return Inertia::render('Admin/Offers/Edit', [
                'offer' => $offer,
                'partners' => $partners,
            ]);
        } catch (\Exception $e) {
            abort(404, $e->getMessage());
        }
    }

    /**
     * Update offer
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'description' => 'required|string|min:10',
            'document' => 'nullable|file|mimes:pdf|max:10240', // 10MB max
        ]);

        try {
            $offer = $this->offerService->updateOffer($id, $validated, auth()->user());

            return redirect()
                ->route('admin.offers.show', $offer->id)
                ->with('success', 'Offer updated successfully');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Delete offer
     */
    public function destroy(int $id)
    {
        try {
            $this->offerService->deleteOffer($id, auth()->user());

            return redirect()
                ->route('admin.offers.list')
                ->with('success', 'Offer deleted successfully');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }
}
