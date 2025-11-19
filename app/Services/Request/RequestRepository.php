<?php

namespace App\Services\Request;

use App\Models\Request;
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
    public function findById(int $id): ?Request
    {
        return Request::with(['status', 'user', 'detail', 'activeOffer.documents'])
            ->find($id);
    }

    /**
     * Create new request
     */
    public function create(array $data): Request
    {
        return Request::create($data);
    }

    /**
     * Update existing request
     */
    public function update(Request $request, array $data): bool
    {
        return $request->update($data);
    }

    /**
     * Delete request
     */
    public function delete(Request $request): bool
    {
        return $request->delete();
    }

    /**
     * Get all requests with optional enhancement
     */
    public function getAll(): Collection
    {
        return Request::with(['status', 'detail', 'user', 'offers'])->get();
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
    public function createOrUpdateDetail(Request $request, array $data): void
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
}
