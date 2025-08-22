<?php

namespace App\Services;

use App\Http\Resources\RequestResource;
use App\Models\Request;
use App\Models\Request\Offer;
use App\Models\Request\Status;
use App\Models\User;
use App\Services\Request\RequestPermissionService;
use App\Services\Request\RequestRepository;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RequestService
{
    public function __construct(
        private readonly RequestRepository $repository
    ) {
    }

    /**
     * Store a new request or update existing one
     */
    public function storeRequest(User $user, array $data, ?Request $request = null, $mode = 'submit'): Request
    {
        $statusId = match ($mode) {
            'draft' => $this->getStatusId('under_review'),
            default => $this->getStatusId('draft'),
        };
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

    public function getAllRequests(): Collection
    {
        return $this->repository->getAll();
    }

    /**
     * Find request by ID with authorization
     */
    public function findRequest(int $id): ?Request
    {
        return $this->repository->findById($id);
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
     * Get paginated requests with search and sorting
     */
    public function getPaginatedRequests(array $searchFilters = [], array $sortFilters = []): LengthAwarePaginator
    {
        return $this->repository->getPaginated($searchFilters, $sortFilters)->withQueryString();
    }


    /**
     * Get public requests (for partners)
     */
    public function getPublicRequests(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        return $this->repository->getPublicRequests($searchFilters, $sortFilters)->withQueryString();
    }

    /**
     * Get matched requests for user
     */
    public function getMatchedRequests(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        return $this->repository->getMatchedRequests($user, $searchFilters, $sortFilters)->withQueryString();
    }


    /**
     * Get user's requests
     */
    public function getUserRequests(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        return $this->repository->getUserRequests($user, $searchFilters, $sortFilters)->withQueryString();
    }

    /**
     * Get request by ID (for admin/system use)
     */
    public function getRequestById(int $id, ?User $user = null): ?Request
    {
        return $this->repository->findById($id);
    }

    /**
     * Get status ID by code
     */
    private function getStatusId(string $statusCode): ?int
    {
        $status = $this->repository->getStatusByCode($statusCode);
        return $status?->getAttribute('id');
    }

    /**
     * Get available statuses for filtering
     */
    public static function getAvailableStatuses()
    {
        return Status::select('id', 'status_code', 'status_label')
            ->orderBy('status_label')
            ->get();
    }

}
