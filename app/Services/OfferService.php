<?php

namespace App\Services;

use App\Models\Request\Offer;
use App\Models\Request;
use App\Models\User;
use App\Models\Document;
use App\Enums\RequestOfferStatus;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OfferService
{
    /**
     * Get paginated offers with search and sorting
     */
    public function getPaginatedOffers(array $searchFilters = [], array $sortFilters = []): LengthAwarePaginator
    {
        $query = Offer::with(['request', 'request.status', 'request.user', 'matchedPartner', 'documents']);

        // Apply search filters
        if (!empty($searchFilters['description'])) {
            $query->where('description', 'like', '%' . $searchFilters['description'] . '%');
        }

        if (!empty($searchFilters['partner'])) {
            $query->whereHas('matchedPartner', function ($q) use ($searchFilters) {
                $q->where('name', 'like', '%' . $searchFilters['partner'] . '%');
            });
        }

        if (!empty($searchFilters['request'])) {
            $query->whereHas('request', function ($q) use ($searchFilters) {
                $q->whereHas('detail', function ($subQ) use ($searchFilters) {
                    $subQ->where('capacity_development_title', 'like', '%' . $searchFilters['request'] . '%');
                });
            });
        }

        // Apply sorting
        $sortField = $sortFilters['sort'] ?? 'created_at';
        $sortOrder = $sortFilters['order'] ?? 'desc';

        $query->orderBy($sortField, $sortOrder);

        $perPage = $sortFilters['per_page'] ?? 10;
        return $query->paginate($perPage);
    }

    /**
     * Create a new offer
     */
    public function createOffer(array $data, User $user): Offer
    {
        DB::beginTransaction();

        try {
            // Validate that user can create offers for this request
            $request = Request::findOrFail($data['request_id']);

            if (!$user->hasRole('administrator') && !$user->hasRole('partner')) {
                throw new Exception('Only administrators and partners can create offers');
            }

            if ($user->id === $request->user_id && !$user->hasRole('administrator')) {
                throw new Exception('Cannot create offer for your own request');
            }

            // Create the offer
            $offer = Offer::create([
                'request_id' => $data['request_id'],
                'matched_partner_id' => $data['partner_id'] ?? $user->id,
                'description' => $data['description'],
                'status' => RequestOfferStatus::INACTIVE,
            ]);

            // Handle document upload if provided
            if (isset($data['document']) && $data['document']) {
                $documentService = app(DocumentService::class);
                $documentService->storeDocument($data['document'], $offer, $user, 'offer_document');
            }

            DB::commit();
            return $offer->load(['request', 'matchedPartner', 'documents']);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to create offer: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an existing offer
     */
    public function updateOffer(int $offerId, array $data, User $user): Offer
    {
        DB::beginTransaction();

        try {
            $offer = Offer::with(['request', 'matchedPartner'])->findOrFail($offerId);

            // Check authorization
            if (!$offer->can_edit) {
                throw new Exception('Unauthorized to edit this offer');
            }

            // Update offer data
            $updateData = [];
            if (isset($data['description'])) {
                $updateData['description'] = $data['description'];
            }
            if (isset($data['status'])) {
                $updateData['status'] = $data['status'];
            }

            $offer->update($updateData);

            // Handle document upload if provided
            if (isset($data['document']) && $data['document']) {
                $documentService = app(DocumentService::class);
                $documentService->storeDocument($data['document'], $offer, $user, 'offer_document');
            }

            DB::commit();
            return $offer->load(['request', 'matchedPartner', 'documents']);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to update offer: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete an offer
     */
    public function deleteOffer(int $offerId, User $user): bool
    {
        DB::beginTransaction();

        try {
            $offer = Offer::findOrFail($offerId);

            // Check authorization
            if (!$offer->can_delete) {
                throw new Exception('Unauthorized to delete this offer');
            }

            // Delete associated documents
            foreach ($offer->documents as $document) {
                $documentService = app(DocumentService::class);
                $documentService->deleteDocument($document->id, $user);
            }

            // Delete the offer
            $offer->delete();

            DB::commit();
            return true;

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete offer: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get offer by ID with authorization check
     */
    public function getOfferById(int $offerId, User $user): Offer
    {
        $offer = Offer::with(['request', 'request.status', 'request.user', 'matchedPartner', 'documents','request.detail'])
            ->findOrFail($offerId);

        if (!$offer->can_view) {
            throw new Exception('Unauthorized to view this offer');
        }

        return $offer;
    }

    /**
     * Get offers for a specific request
     */
    public function getOffersForRequest(int $requestId, User $user): Collection
    {
        $request = Request::findOrFail($requestId);

        // Check if user can view offers for this request
        if (!$user->hasRole('administrator') && $user->id !== $request->user_id) {
            throw new Exception('Unauthorized to view offers for this request');
        }

        return Offer::with(['matchedPartner', 'documents'])
            ->where('request_id', $requestId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get offers created by a specific partner
     */
    public function getOffersByPartner(int $partnerId, User $user): Collection
    {
        // Users can only view their own offers unless they're admin
        if (!$user->hasRole('administrator') && $user->id !== $partnerId) {
            throw new Exception('Unauthorized to view offers by this partner');
        }

        return Offer::with(['request', 'request.status', 'request.user', 'documents'])
            ->where('matched_partner_id', $partnerId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Change offer status
     */
    public function changeOfferStatus(int $offerId, RequestOfferStatus $status, User $user): Offer
    {
        DB::beginTransaction();

        try {
            $offer = Offer::findOrFail($offerId);

            // Check authorization
            if (!$offer->can_edit) {
                throw new Exception('Unauthorized to change offer status');
            }

            $offer->update(['status' => $status]);

            DB::commit();
            return $offer->load(['request', 'matchedPartner']);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to change offer status: ' . $e->getMessage());
            throw $e;
        }
    }
}
