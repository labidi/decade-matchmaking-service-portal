<?php

namespace App\Services\Request;

use App\Models\Request as OCDRequest;
use App\Models\Request\Detail;
use App\Models\Request\Status;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\AbstractPaginator;

class RequestRepository
{
    public function __construct(
        private readonly RequestQueryBuilder $queryBuilder
    ) {}

    /**
     * Find request by ID with relationships
     */
    public function findById(int $id): ?OCDRequest
    {
        return OCDRequest::with(['status', 'user', 'detail', 'activeOffer.documents'])
            ->find($id);
    }

    /**
     * Create new request
     */
    public function create(array $data): OCDRequest
    {
        return OCDRequest::create($data);
    }

    /**
     * Update existing request
     */
    public function update(OCDRequest $request, array $data): bool
    {
        return $request->update($data);
    }

    /**
     * Delete request
     */
    public function delete(OCDRequest $request): bool
    {
        return $request->delete();
    }

    /**
     * Get all requests with optional enhancement
     */
    public function getAll(): Collection
    {
        return OCDRequest::with(['status', 'detail', 'user', 'offers'])->get();
    }

    /**
     * Get paginated requests with search and sorting
     */
    public function getPaginated(array $searchFilters = [], array $sortFilters = []): AbstractPaginator
    {
        $query = $this->queryBuilder->buildBaseQuery();
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);

        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Get public requests for partners
     */
    public function getPublicRequests(array $searchFilters = [], array $sortFilters = []): AbstractPaginator
    {
        $query = $this->queryBuilder->buildPublicRequestsQuery();
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);

        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Get user's requests
     */
    public function getUserRequests(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildUserRequestsQuery($user->id);
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);

        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Get matched requests for user
     */
    public function getMatchedRequests(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildMatchedRequestsQuery($user->id);
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);

        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    public function getSubscribedRequests(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildSubscribedRequestsQuery($user->id);
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);

        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Get status by code
     */
    public function getStatusByCode(string $statusCode): ?Status
    {
        return Status::where('status_code', $statusCode)->first();
    }

    /**
     * Create or update request detail
     */
    public function createOrUpdateDetail(OCDRequest $request, array $data): void
    {
        $detailData = [];

        foreach ($data as $key => $value) {
            if ($key == 'mode' || $key == 'id') {
                continue; // Skip mode and id fields as they are not stored in detail
            }

            // Let Laravel's casting handle the data transformation
            // No manual JSON encoding needed - the Detail model's $casts property handles this
            $detailData[$key] = $value;
        }

        if ($request->detail) {
            $request->detail()->update($detailData);
        } else {
            $request->detail()->save(new Detail($detailData));
        }
    }

    /**
     * Check if request exists and user has access
     */
    public function findWithAuthorization(
        int $id,
        ?User $user = null
    ): ?OCDRequest {
        $request = $this->findById($id);

        if (! $request) {
            return null;
        }

        // Check authorization
        if ($user) {
            if ($request->user_id === $user->id) {
                return $request;
            }

            $publicStatuses = ['validated', 'offer_made', 'match_made', 'closed', 'in_implementation'];
            if (in_array($request->status->status_code, $publicStatuses)) {
                return $request;
            }

            return null;
        }

        return $request;
    }
}
