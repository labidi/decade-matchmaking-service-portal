<?php

namespace App\Services;

use App\Models\Request;
use App\Models\Request\Offer;
use App\Models\User;
use App\Services\Request\RequestAnalyticsService;
use App\Services\Request\RequestRepository;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class RequestService
{
    public function __construct(
        private readonly RequestRepository $repository,
        private readonly RequestAnalyticsService $analytics
    ) {
    }

    /**
     * Store a new request or update existing one
     */
    public function storeRequest(User $user, array $data, ?Request $request = null): Request
    {
        $statusId = $this->getStatusId('under_review');
        $requestData = [
            'user_id' => $user->id,
            'status_id' => $statusId
        ];
        if ($request) {
            $this->repository->update($request, $requestData);
        } else {
            $request = $this->repository->create($requestData);
        }
        $this->repository->createOrUpdateDetail($request, $data);
        return $request->load(['status', 'detail']);
    }

    /**
     * Save request as draft
     */
    public function saveDraft(User $user, array $data, ?Request $request = null): Request
    {
        $statusId = $this->getStatusId('draft');
        $requestData = [
            'user_id' => $user->id,
            'status_id' => $statusId,
        ];
        if ($request) {
            $this->repository->update($request, $requestData);
        } else {
            $request = $this->repository->create($requestData);
        }
        $this->repository->createOrUpdateDetail($request, $data);
        return $request->load(['status', 'detail']);
    }

    public function getAllRequests(): Collection
    {
        return $this->repository->getAll();
    }

    public function getAllRequestsAvailableForOffers(): Collection
    {
        return $this->repository->getAllAvailableForOffers();
    }


    /**
     * Find request by ID with authorization
     */
    public function findRequest(int $id, ?User $user = null): ?Request
    {
        return $this->repository->findWithAuthorization($id, $user);
    }

    /**
     * Update request status
     */
    public function updateRequestStatus(int $requestId, string $statusCode, User $user): Request
    {
        $request = $this->repository->findById($requestId);

        if (!$request) {
            throw new Exception('Request not found');
        }

        // Check authorization
        if ($request->user_id !== $user->id && !$user->hasRole('administrator')) {
            throw new Exception('Unauthorized to update this request');
        }

        $statusId = $this->getStatusId($statusCode);
        if (!$statusId) {
            throw new Exception('Invalid status code');
        }

        return $this->repository->update($request, ['status_id' => $statusId]) ? $request : throw new Exception(
            'Failed to update request status'
        );
    }

    /**
     * Delete request
     */
    public function deleteRequest(int $requestId, User $user): bool
    {
        $request = $this->repository->findById($requestId);

        if (!$request) {
            throw new Exception('Request not found');
        }

        // Check authorization
        if ($request->user_id !== $user->id && !$user->hasRole('administrator')) {
            throw new Exception('Unauthorized to delete this request');
        }

        DB::transaction(function () use ($request) {
            // Delete normalized data if exists
            if ($request->detail_id) {
                $request->detail()->delete();
            }

            // Delete the request
            $this->repository->delete($request);
        });

        return true;
    }

    /**
     * Search requests with filters
     */
    public function searchRequests(array $filters, User $user): Collection
    {
        return $this->repository->search($filters);
    }

    /**
     * Get paginated requests with search and sorting
     */
    public function getPaginatedRequests(array $searchFilters = [], array $sortFilters = []): LengthAwarePaginator
    {
        return $this->repository->getPaginated($searchFilters, $sortFilters);
    }


    /**
     * Get public requests (for partners)
     */
    public function getPublicRequests(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        return $this->repository->getPublicRequests($searchFilters, $sortFilters);
    }

    /**
     * Get matched requests for user
     */
    public function getMatchedRequests(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        return $this->repository->getMatchedRequests($user, $searchFilters, $sortFilters);
    }


    /**
     * Get user's requests
     */
    public function getUserRequests(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        return $this->repository->getUserRequests($user, $searchFilters, $sortFilters);
    }

    /**
     * Get request statistics
     */
    public function getRequestStats(User $user): array
    {
        return $this->analytics->getUserRequestStats($user);
    }

    /**
     * Get analytics data
     */
    public function getAnalytics(): array
    {
        return $this->analytics->getAnalytics();
    }

    /**
     * Get active offer for a request
     */
    public function getActiveOffer(int $requestId): ?Offer
    {
        return Offer::where('request_id', $requestId)
            ->where('status', \App\Enums\RequestOfferStatus::ACTIVE)
            ->first();
    }

    /**
     * Get active offer with documents for a request
     */
    public function getActiveOfferWithDocuments(int $requestId): ?Offer
    {
        return Offer::where('request_id', $requestId)
            ->where('status', \App\Enums\RequestOfferStatus::ACTIVE)
            ->with(['documents', 'matchedPartner'])
            ->first();
    }

    /**
     * Get request actions based on status and user
     */
    public function getRequestActions(Request $request, User $user): array
    {
        $actions = [];

        if ($request->user_id === $user->id && $request->status->status_code === 'draft') {
            $actions['canEdit'] = true;
            $actions['canDelete'] = true;
        }

        if ($request->status->status_code === 'offer_made' && $request->user_id === $user->id && $request->activeOffer) {
            $actions['canAcceptOffer'] = true;
            $actions['canRequestClarificationForOffer'] = true;
        }
        if ($request->status->status_code === 'validated' && $request->user_id !== $user->id) {
            $actions[] = 'express_interest';
        }

        $actions['view'] = true;
        $actions['export'] = true;

        return $actions;
    }

    /**
     * Get request for export
     */
    public function getRequestForExport(int $requestId, User $user): ?Request
    {
        $request = $this->findRequest($requestId, $user);

        if (!$request) {
            return null;
        }

        return $request;
    }

    /**
     * Get request by ID (for admin/system use)
     */
    public function getRequestById(int $id, ?User $user = null): ?Request
    {
        return $this->repository->findById($id);
    }

    /**
     * Get request title
     */
    public function getRequestTitle(Request $request): string
    {
        if ($request->detail && $request->detail->capacity_development_title) {
            return $request->detail->capacity_development_title;
        }
        return 'N/A';
    }

    /**
     * Get requester name
     */
    public function getRequesterName(Request $request): string
    {
        if ($request->detail) {
            return trim($request->detail->first_name . ' ' . $request->detail->last_name);
        }
        return 'N/A';
    }


    /**
     * Accept an active offer for a request
     */
    public function acceptOffer(Request $request, User $user): array
    {
        try {
            if (!$request->activeOffer) {
                return [
                    'success' => false,
                    'message' => 'No active offer found for this request'
                ];
            }

            DB::transaction(function () use ($request) {
                // Update request status to 'offer_accepted'
                $statusId = $this->getStatusId('offer_accepted');
                if ($statusId) {
                    $this->repository->update($request, ['status_id' => $statusId]);
                }

                // Update the offer status to 'accepted'
                $request->activeOffer->update([
                    'status' => \App\Enums\RequestOfferStatus::ACCEPTED
                ]);
            });

            return [
                'success' => true,
                'message' => 'Offer accepted successfully',
                'status' => 'offer_accepted'
            ];

        } catch (Exception $e) {
            Log::error('Failed to accept offer', [
                'request_id' => $request->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to accept offer'
            ];
        }
    }

    /**
     * Request clarification for an active offer
     */
    public function requestClarification(Request $request, User $user, ?string $message = null): array
    {
        try {
            if (!$request->activeOffer) {
                return [
                    'success' => false,
                    'message' => 'No active offer found for this request'
                ];
            }

            DB::transaction(function () use ($request) {
                // Update request status to 'clarification_requested'
                $statusId = $this->getStatusId('clarification_requested');
                if ($statusId) {
                    $this->repository->update($request, ['status_id' => $statusId]);
                }

                // Update the offer status to 'clarification_requested'
                $request->activeOffer->update([
                    'status' => \App\Enums\RequestOfferStatus::CLARIFICATION_REQUESTED
                ]);
            });

            return [
                'success' => true,
                'message' => 'Clarification request sent successfully',
                'status' => 'clarification_requested'
            ];

        } catch (Exception $e) {
            Log::error('Failed to request clarification', [
                'request_id' => $request->id,
                'user_id' => $user->id,
                'message' => $message,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to request clarification'
            ];
        }
    }

    /**
     * Get status ID by code
     */
    private function getStatusId(string $statusCode): ?int
    {
        $status = $this->repository->getStatusByCode($statusCode);
        return $status ? $status->id : null;
    }

}
