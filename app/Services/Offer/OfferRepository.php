<?php

namespace App\Services\Offer;

use App\Models\Request\Offer;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class OfferRepository
{
    public function __construct(
        private readonly OfferQueryBuilder $queryBuilder
    ) {
    }

    /**
     * Find offer by ID with relationships
     */
    public function findById(int $id): ?Offer
    {
        return Offer::with(['request', 'request.status', 'request.user', 'matchedPartner', 'documents'])
            ->find($id);
    }

    /**
     * Create new offer
     */
    public function create(array $data): Offer
    {
        return Offer::create($data);
    }

    /**
     * Update existing offer
     */
    public function update(Offer $offer, array $data): bool
    {
        return $offer->update($data);
    }

    /**
     * Delete offer
     */
    public function delete(Offer $offer): bool
    {
        return $offer->delete();
    }

    /**
     * Get paginated offers with search and sorting
     */
    public function getPaginated(array $searchFilters = [], array $sortFilters = []): LengthAwarePaginator
    {
        $query = $this->queryBuilder->buildBaseQuery();
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Get user's offers (as partner)
     */
    public function getUserOffers(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildUserOffersQuery($user->id);
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Get offers on user's requests
     */
    public function getRequestOffers(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $query = $this->queryBuilder->buildRequestOffersQuery($user->id);
        $query = $this->queryBuilder->applySearchFilters($query, $searchFilters);
        $query = $this->queryBuilder->applySorting($query, $sortFilters);
        return $this->queryBuilder->applyPagination($query, $sortFilters);
    }

    /**
     * Search offers with filters
     */
    public function search(array $filters): Collection
    {
        $query = $this->queryBuilder->buildBaseQuery();
        $query = $this->queryBuilder->applySearchFilters($query, $filters);
        return $query->orderBy('created_at', 'desc')->get();
    }
}