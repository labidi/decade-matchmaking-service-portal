<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\Document\DocumentType;
use App\Enums\Offer\RequestOfferStatus;
use App\Models\Request;
use App\Models\Request\Offer;
use App\Models\User;
use App\Services\Offer\OfferRepository;
use Exception;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OfferService
{
    public function __construct(
        private readonly DocumentService $documentService,
        private readonly OfferRepository $repository
    ) {}

    /**
     * Get paginated offers with search and sorting
     */
    public function getPaginatedOffers(array $searchFilters = [], array $sortFilters = []): AbstractPaginator
    {
        return $this->repository->getPaginated($searchFilters, $sortFilters);
    }

    /**
     * Create a new offer
     */
    public function createOffer(array $data, User $user): Offer
    {
        try {
            // Validate that user can create offers for this request
            $request = Request::findOrFail($data['request_id']);

            if (! $user->hasRole('administrator') && ! $user->hasRole('partner')) {
                throw new Exception('Only administrators and partners can create offers');
            }

            if ($user->id === $request->user_id && ! $user->hasRole('administrator')) {
                throw new Exception('Cannot create offer for your own request');
            }

            // Create the offer
            $offer = $this->repository->create([
                'request_id' => $data['request_id'],
                'matched_partner_id' => $data['partner_id'] ?? $user->id,
                'description' => $data['description'],
                'status' => RequestOfferStatus::INACTIVE,
            ]);

            // Handle document upload if provided
            if (isset($data['document']) && $data['document']) {
                $this->documentService->storeDocumentForOffer(
                    $data['document'],
                    DocumentType::OFFER_DOCUMENT->value,
                    $offer,
                    $user
                );
            }

            return $offer->load(['request', 'matchedPartner', 'documents']);
        } catch (Exception $e) {
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
            $offer = $this->repository->findById($offerId);
            if (! $offer) {
                throw new Exception('Offer not found');
            }

            // Check authorization
            if (! $offer->can_edit) {
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

            $this->repository->update($offer, $updateData);

            // Handle document upload if provided
            if (isset($data['document']) && $data['document']) {
                $documentService = app(DocumentService::class);
                $documentService->storeDocument($data['document'], $offer, $user, 'offer_document');
            }

            DB::commit();

            return $offer->load(['request', 'matchedPartner', 'documents']);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to update offer: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete an offer
     */
    public function deleteOffer(int $offerId): bool
    {
        DB::beginTransaction();

        try {
            $offer = $this->repository->findById($offerId);
            if (! $offer) {
                throw new Exception('Offer not found');
            }

            // Delete associated documents
            foreach ($offer->documents as $document) {
                $this->documentService->deleteDocument($document);
            }

            // Delete the offer
            $this->repository->delete($offer);
            DB::commit();

            return true;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete offer: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get offer by ID with authorization check
     */
    public function getOfferById(int $offerId): Offer
    {
        $offer = Offer::with(
            ['request', 'request.status', 'request.user', 'matchedPartner', 'documents', 'request.detail']
        )
            ->findOrFail($offerId);

        return $offer;
    }

    /**
     * Change offer status
     */
    public function changeOfferStatus(Offer $offer, RequestOfferStatus $status): Offer
    {
        $this->repository->update($offer, ['status' => $status]);

        return $offer;
    }

    /**
     * Accept an offer
     */
    public function acceptOffer(Offer $offer, User $acceptedBy): Offer
    {
        try {
            // Validate that the user can accept this offer
            if ($offer->request->user_id !== $acceptedBy->id) {
                throw new Exception('Only the request owner can accept offers for their request');
            }

            // Validate that the offer is in a state that can be accepted
            if ($offer->status !== RequestOfferStatus::ACTIVE) {
                throw new Exception('Only active offers can be accepted');
            }

            if ($offer->is_accepted) {
                throw new Exception('This offer has already been accepted');
            }

            // Update the offer to accepted status
            $this->repository->update($offer, [
                'is_accepted' => true,
            ]);

            return $offer->fresh();
        } catch (Exception $e) {
            throw $e;
        }
    }
}
