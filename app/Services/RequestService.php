<?php

namespace App\Services;

use App\Models\Request as OCDRequest;
use App\Models\Request\Offer;
use App\Models\User;
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
    public function storeRequest(User $user, array $data, ?OCDRequest $request = null): OCDRequest
    {
        DB::beginTransaction();

        try {
            $statusId = $this->getStatusId('under_review');
            $requestData = [
                'user_id' => $user->id,
                'status_id' => $statusId,
                'request_data' => json_encode($data), // Keep JSON for backward compatibility
            ];

            // Create or update the main request record
            if ($request) {
                $this->repository->update($request, $requestData);
            } else {
                $request = $this->repository->create($requestData);
            }

            // Create normalized detail if table exists
            if (Schema::hasTable('request_details')) {
                $this->repository->createOrUpdateDetail($request, $data);
            }

            DB::commit();
            return $request->load(['status', 'detail']);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to store request', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Save request as draft
     */
    public function saveDraft(User $user, array $data, ?OCDRequest $request = null): OCDRequest
    {
        DB::beginTransaction();
        try {
            $statusId = $this->getStatusId('draft');
            $requestData = [
                'user_id' => $user->id,
                'status_id' => $statusId,
                'request_data' => json_encode($data),
            ];

            // Create or update the main request record
            if ($request) {
                $this->repository->update($request, $requestData);
            } else {
                $request = $this->repository->create($requestData);
            }

            // Create normalized detail if table exists
            $this->repository->createOrUpdateDetail($request, $data);
            DB::commit();
            return $request->load(['status', 'detail']);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to save draft', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    public function getAllRequests(): Collection
    {
        return $this->repository->getAll();
    }


    /**
     * Find request by ID with authorization
     */
    public function findRequest(int $id, ?User $user = null): ?OCDRequest
    {
        return $this->repository->findWithAuthorization($id, $user);
    }

    /**
     * Update request status
     */
    public function updateRequestStatus(int $requestId, string $statusCode, User $user) : OCDRequest
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

        return $this->repository->update($request, ['status_id' => $statusId]) ? $request : throw new Exception('Failed to update request status');
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
            ->where('status', 'active')
            ->first();
    }

    /**
     * Get request actions based on status and user
     */
    public function getRequestActions(OCDRequest $request, User $user): array
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
    public function getRequestForExport(int $requestId, User $user): ?OCDRequest
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
    public function getRequestById(int $id, ?User $user = null): ?OCDRequest
    {
        return $this->repository->findById($id);
    }

    /**
     * Get request title
     */
    public function getRequestTitle(OCDRequest $request): string
    {
        if ($request->detail && $request->detail->capacity_development_title) {
            return $request->detail->capacity_development_title;
        }
        $request->toJson();
        $data = json_decode(json_encode($request->request_data), true);
        return $data['capacity_development_title'] ?? 'Untitled Request';
    }

    /**
     * Get requester name
     */
    public function getRequesterName(OCDRequest $request): string
    {
        if ($request->detail) {
            return trim($request->detail->first_name . ' ' . $request->detail->last_name);
        }

        $data = json_decode(json_encode($request->request_data), true);
        return trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? ''));
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
