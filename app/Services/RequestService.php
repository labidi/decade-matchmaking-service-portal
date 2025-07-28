<?php

namespace App\Services;

use App\Models\Request as OCDRequest;
use App\Models\Request\Offer;
use App\Models\Request\Detail;
use App\Models\Request\Status;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class RequestService
{
    /**
     * Store a new request or update existing one
     */
    public function storeRequest(User $user, array $data, ?OCDRequest $request = null): OCDRequest
    {
        DB::beginTransaction();

        try {
            // Create or update the main request record
            if ($request) {
                $request->update([
                    'user_id' => $user->id,
                    'status_id' => $this->getStatusId('under_review'),
                    'request_data' => json_encode($data), // Keep JSON for backward compatibility
                ]);
            } else {
                $request = OCDRequest::create([
                    'user_id' => $user->id,
                    'status_id' => $this->getStatusId('under_review'),
                    'request_data' => json_encode($data),
                ]);
            }

            // Create normalized detail if table exists
            if (Schema::hasTable('request_details')) {
                $this->createOrUpdateRequestDetail($request, $data);
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
            // Create or update the main request record
            if ($request) {
                $request->update([
                    'user_id' => $user->id,
                    'status_id' => $this->getStatusId('draft'),
                    'request_data' => json_encode($data),
                ]);
            } else {
                $request = OCDRequest::create([
                    'user_id' => $user->id,
                    'status_id' => $this->getStatusId('draft'),
                    'request_data' => json_encode($data),
                ]);
            }
            // Create normalized detail if table exists
            $this->createOrUpdateRequestDetail($request, $data);
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

    public function getAllRequests(bool $raw = false): Collection
    {
        $requests = OCDRequest::with(['status', 'detail', 'user', 'offers']);
        return $raw ? $requests : $requests->map(function ($request) {
            return $this->enhanceRequestData($request);
        });
    }


    /**
     * Find request by ID with authorization
     */
    public function findRequest(int $id, ?User $user = null): ?OCDRequest
    {
        $request = OCDRequest::with(
            ['status', 'user', 'detail', 'activeOffer.documents']
        )
            ->find($id);

        if (!$request) {
            return null;
        }

        // Check authorization
        if ($user) {
            if ($request->user_id === $user->id) {
                return $this->enhanceRequestData($request);
            }

            $publicStatuses = ['validated', 'offer_made', 'match_made', 'closed', 'in_implementation'];
            if (in_array($request->status->status_code, $publicStatuses)) {
                return $this->enhanceRequestData($request);
            }

            return null;
        }

        return $this->enhanceRequestData($request);
    }

    /**
     * Update request status
     */
    public function updateRequestStatus(int $requestId, string $statusCode, User $user): array
    {
        $request = OCDRequest::find($requestId);

        if (!$request) {
            throw new Exception('Request not found');
        }

        // Check authorization
        if ($request->user_id !== $user->id && !$user->is_admin) {
            throw new Exception('Unauthorized to update this request');
        }

        $statusId = $this->getStatusId($statusCode);
        if (!$statusId) {
            throw new Exception('Invalid status code');
        }

        $request->update(['status_id' => $statusId]);

        return [
            'success' => true,
            'message' => 'Request status updated successfully',
            'request' => $this->enhanceRequestData($request)
        ];
    }

    /**
     * Delete request
     */
    public function deleteRequest(int $requestId, User $user): bool
    {
        $request = OCDRequest::find($requestId);

        if (!$request) {
            throw new Exception('Request not found');
        }

        // Check authorization
        if ($request->user_id !== $user->id && !$user->is_admin) {
            throw new Exception('Unauthorized to delete this request');
        }

        DB::transaction(function () use ($request) {
            // Delete normalized data if exists
            if ($request->detail_id) {
                $request->detail()->delete();
            }

            // Delete the request
            $request->delete();
        });

        return true;
    }

    /**
     * Search requests with filters
     */
    public function searchRequests(array $filters, User $user): Collection
    {
        $query = OCDRequest::with(['status', 'detail']);

        // Search in JSON data (fallback)
        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function (Builder $q) use ($searchTerm) {
                $q->where('request_data->capacity_development_title', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('request_data->gap_description', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('request_data->expected_outcomes', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Use normalized search if available
        if (Schema::hasTable('request_details') && !empty($filters['search'])) {
            $query->whereHas('detail', function (Builder $q) use ($filters) {
                $q->whereRaw(
                    'MATCH(capacity_development_title, gap_description, expected_outcomes) AGAINST(? IN BOOLEAN MODE)',
                    [$filters['search']]
                );
            });
        }


        // Filter by status
        if (!empty($filters['status'])) {
            $query->whereHas('status', function (Builder $q) use ($filters) {
                $q->whereIn('status_code', $filters['status']);
            });
        }

        // Filter by activity type
        if (!empty($filters['activity'])) {
            $query->where('request_data->related_activity', $filters['activity']);
        }

        return $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) {
                return $this->enhanceRequestData($request);
            });
    }

    /**
     * Get paginated requests with search and sorting
     */
    public function getPaginatedRequests(array $searchFilters = [], array $sortFilters = []): LengthAwarePaginator
    {
        $query = OCDRequest::with(['status', 'detail', 'user', 'offers']);

        // Apply search filters
        if (!empty($searchFilters['user'])) {
            $query->whereHas('user', function ($q) use ($searchFilters) {
                $q->where('name', 'like', '%' . $searchFilters['user'] . '%');
            });
        }

        if (!empty($searchFilters['title'])) {
            $query->whereHas('detail', function ($q) use ($searchFilters) {
                $q->where('capacity_development_title', 'like', '%' . $searchFilters['title'] . '%');
            });
        }

        // Apply sorting with special handling for user relationship
        if (!empty($sortFilters['field']) && !empty($sortFilters['order'])) {
            if ($sortFilters['field'] === 'user_id') {
                $query->join('users', 'requests.user_id', '=', 'users.id')
                    ->orderBy('users.name', $sortFilters['order'])
                    ->select('requests.*');
            } else {
                $query->orderBy($sortFilters['field'], $sortFilters['order']);
            }

            // If not sorting by created_at, add it as a secondary sort for consistency
            if ($sortFilters['field'] !== 'created_at') {
                $query->orderBy('created_at', 'desc');
            }
        } else {
            // Default sorting
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $sortFilters['per_page'] ?? 10;

        return $query->paginate($perPage);
    }

    /**
     * Get paginated requests with search and sorting
     */
    public function applyFilteringAndPagination(
        $requests,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        // Apply search filters
        if (!empty($searchFilters['user'])) {
            $requests->whereHas('user', function ($q) use ($searchFilters) {
                $q->where('name', 'like', '%' . $searchFilters['user'] . '%');
            });
        }

        if (!empty($searchFilters['title'])) {
            $requests->whereHas('detail', function ($q) use ($searchFilters) {
                $q->where('capacity_development_title', 'like', '%' . $searchFilters['title'] . '%');
            });
        }

        // Apply sorting with special handling for user relationship
        if (!empty($sortFilters['field']) && !empty($sortFilters['order'])) {
            if ($sortFilters['field'] === 'user_id') {
                $requests->join('users', 'requests.user_id', '=', 'users.id')
                    ->orderBy('users.name', $sortFilters['order'])
                    ->select('requests.*');
            } else {
                $requests->orderBy($sortFilters['field'], $sortFilters['order']);
            }

            // If not sorting by created_at, add it as a secondary sort for consistency
            if ($sortFilters['field'] !== 'created_at') {
                $requests->orderBy('created_at', 'desc');
            }
        } else {
            // Default sorting
            $requests->orderBy('created_at', 'desc');
        }

        $perPage = $sortFilters['per_page'] ?? 10;

        return $requests->paginate($perPage);
    }

    /**
     * Get public requests (for partners)
     */
    public function getPublicRequests(
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $publicStatuses = ['validated', 'offer_made', 'match_made', 'closed', 'in_implementation'];

        $requests = OCDRequest::with(['status', 'detail'])
            ->whereHas('status', function (Builder $query) use ($publicStatuses) {
                $query->whereIn('status_code', $publicStatuses);
            });
        return $this->applyFilteringAndPagination($requests, $searchFilters, $sortFilters);
    }

    /**
     * Get matched requests for user
     */
    public function getMatchedRequests(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $requests = OCDRequest::with(['status', 'detail'])
            ->whereHas('offers', function (Builder $query) use ($user) {
                $query->where('matched_partner_id', $user->id);
            });
        return $this->applyFilteringAndPagination($requests, $searchFilters, $sortFilters);
    }


    /**
     * Get user's requests
     */
    public function getUserRequests(
        User $user,
        array $searchFilters = [],
        array $sortFilters = []
    ): LengthAwarePaginator {
        $requests = OCDRequest::with(['status', 'detail'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        return $this->applyFilteringAndPagination($requests, $searchFilters, $sortFilters);
    }

    /**
     * Get request statistics
     */
    public function getRequestStats(User $user): array
    {
        $userRequests = $this->getUserRequests($user);

        return [
            'total' => $userRequests->count(),
            'draft' => $userRequests->where('status.status_code', 'draft')->count(),
            'under_review' => $userRequests->where('status.status_code', 'under_review')->count(),
            'validated' => $userRequests->where('status.status_code', 'validated')->count(),
            'offer_made' => $userRequests->where('status.status_code', 'offer_made')->count(),
            'match_made' => $userRequests->where('status.status_code', 'match_made')->count(),
            'in_implementation' => $userRequests->where('status.status_code', 'in_implementation')->count(),
            'closed' => $userRequests->where('status.status_code', 'closed')->count(),
        ];
    }

    /**
     * Get analytics data
     */
    public function getAnalytics(): array
    {
        $analytics = [
            'total_requests' => OCDRequest::count(),
            'requests_by_status' => $this->getRequestsByStatus(),
        ];

        // Add normalized analytics if available
        if (Schema::hasTable('request_details')) {
            $analytics['requests_by_activity'] = $this->getRequestsByActivity();
            $analytics['popular_subthemes'] = $this->getPopularSubthemes();
            $analytics['support_type_distribution'] = $this->getSupportTypeDistribution();
        }

        return $analytics;
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

        // Add computed fields for export
        $request->setAttribute('export_title', $this->getRequestTitle($request));
        $request->setAttribute('export_requester', $this->getRequesterName($request));

        return $request;
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
     * Create or update request detail
     */
    private function createOrUpdateRequestDetail(OCDRequest $request, array $data): void
    {
        $detailData = [
            'capacity_development_title' => $data['capacity_development_title'] ?? null,
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'email' => $data['email'] ?? null,
            'related_activity' => $data['related_activity'] ?? null,
            'gap_description' => $data['gap_description'] ?? null,
            'expected_outcomes' => $data['expected_outcomes'] ?? null,
            'unique_related_decade_action_id' => $data['unique_related_decade_action_id'] ?? null,
            'project_url' => $data['project_url'] ?? null,
            'delivery_countries' => $data['delivery_countries'] ?? null,
            'budget_breakdown' => $data['budget_breakdown'] ?? null,
            'completion_date' => $data['completion_date'] ?? null,
            // Save arrays as JSON in separate fields
            'subthemes' => $data['subthemes'] ?? [],
            'support_types' => $data['support_types'] ?? [],
            'target_audience' => $data['target_audience'] ?? [],
        ];

        if ($request->detail) {
            $request->detail()->update($detailData);
        } else {
            $request->detail()->save(new Detail($detailData));
        }
    }


    /**
     * Enhance request with computed data
     */
    private function enhanceRequestData(OCDRequest $request): OCDRequest
    {
        $request->setAttribute('title', $this->getRequestTitle($request));
        $request->setAttribute('requester_name', $this->getRequesterName($request));
        return $request;
    }

    /**
     * Get status ID by code
     */
    private function getStatusId(string $statusCode): ?int
    {
        $status = Status::where('status_code', $statusCode)->first();
        return $status ? $status->id : null;
    }

    /**
     * Get requests by status
     */
    private function getRequestsByStatus(): array
    {
        return OCDRequest::join('request_statuses', 'requests.status_id', '=', 'request_statuses.id')
            ->select('request_statuses.status_label', DB::raw('count(*) as count'))
            ->groupBy('request_statuses.id', 'request_statuses.status_label')
            ->get()
            ->pluck('count', 'status_label')
            ->toArray();
    }

    /**
     * Get requests by activity
     */
    private function getRequestsByActivity(): array
    {
        return Detail::select('related_activity', DB::raw('count(*) as count'))
            ->whereNotNull('related_activity')
            ->groupBy('related_activity')
            ->get()
            ->pluck('count', 'related_activity')
            ->toArray();
    }

    /**
     * Get popular subthemes
     */
    private function getPopularSubthemes(): array
    {
        // Use JSON fields for better performance
        $subthemes = Detail::select('subthemes')
            ->whereNotNull('subthemes')
            ->where('subthemes', '!=', '[]')
            ->get()
            ->pluck('subthemes')
            ->flatten()
            ->countBy()
            ->sortDesc()
            ->take(10);

        return $subthemes->toArray();
    }

    /**
     * Get support type distribution
     */
    private function getSupportTypeDistribution(): array
    {
        // Use JSON fields for better performance
        $supportTypes = Detail::select('support_types')
            ->whereNotNull('support_types')
            ->where('support_types', '!=', '[]')
            ->get()
            ->pluck('support_types')
            ->flatten()
            ->countBy();

        return $supportTypes->toArray();
    }
}
