<?php

namespace App\Services;

use App\Models\Request as OCDRequest;
use App\Models\Request\RequestStatus;
use App\Models\Request\RequestOffer;
use App\Models\User;
use App\Enums\RequestOfferStatus;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class OcdRequestService
{
    /**
     * Save request as draft
     */
    public function saveDraft(User $user, array $data, ?OCDRequest $request = null): OCDRequest
    {
        return DB::transaction(function () use ($user, $data, $request) {
            if (!$request) {
                $request = new OCDRequest();
                $request->status()->associate(RequestStatus::getDraftStatus());
                $request->user()->associate($user);
            }
            
            $request->request_data = json_encode($data);
            $request->save();

            Log::info('Request draft saved', [
                'request_id' => $request->id,
                'user_id' => $user->id,
                'title' => $data['capacity_development_title'] ?? 'N/A'
            ]);

            return $request;
        });
    }

    /**
     * Store/update request
     */
    public function storeRequest(User $user, array $data, ?OCDRequest $request = null): OCDRequest
    {
        return DB::transaction(function () use ($user, $data, $request) {
            if (!$request) {
                $request = new OCDRequest();
                $request->user()->associate($user);
            }
            
            $request->request_data = json_encode($data);
            $request->status()->associate(RequestStatus::getUnderReviewStatus());
            $request->save();

            Log::info('Request submitted', [
                'request_id' => $request->id,
                'user_id' => $user->id,
                'title' => $data['capacity_development_title'] ?? 'N/A'
            ]);

            return $request;
        });
    }

    /**
     * Get user's requests
     */
    public function getUserRequests(User $user): Collection
    {
        return OCDRequest::with('status')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get public requests (for partners to view)
     */
    public function getPublicRequests(User $user): Collection
    {
        return OCDRequest::with('status')->whereHas(
            'status',
            function (Builder $query) {
                $query->where('status_code', 'validated');
                $query->orWhere('status_code', 'offer_made');
                $query->orWhere('status_code', 'match_made');
                $query->orWhere('status_code', 'closed');
                $query->orWhere('status_code', 'in_implementation');
            }
        )->where('user_id', '!=', $user->id)
        ->orderBy('created_at', 'desc')
        ->get();
    }

    /**
     * Get matched requests for user
     */
    public function getMatchedRequests(User $user): Collection
    {
        return OCDRequest::with('status')->whereHas(
            'status',
            function (Builder $query) {
                $query->orWhere('status_code', 'in_implementation');
                $query->orWhere('status_code', 'closed');
            }
        )->where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get();
    }

    /**
     * Find request by ID with authorization check
     */
    public function findRequest(int $id, ?User $user = null): ?OCDRequest
    {
        $request = OCDRequest::with(['status', 'user', 'offer'])->find($id);
        
        if (!$request) {
            return null;
        }

        // If user is provided, check if they can access this request
        if ($user) {
            // Users can always see their own requests
            if ($request->user_id === $user->id) {
                return $request;
            }
            
            // Partners can see public requests
            $publicStatuses = ['validated', 'offer_made', 'match_made', 'closed', 'in_implementation'];
            if (in_array($request->status->status_code, $publicStatuses)) {
                return $request;
            }
            
            return null;
        }

        return $request;
    }

    /**
     * Update request status
     */
    public function updateRequestStatus(int $requestId, string $statusCode, User $user): array
    {
        $request = $this->findRequest($requestId, $user);
        
        if (!$request) {
            throw new Exception('Request not found', 404);
        }

        $status = RequestStatus::where('status_code', $statusCode)->first();
        if (!$status) {
            throw new Exception('Invalid status code', 422);
        }

        // Check if user can update this request (admin or owner)
        if ($request->user_id !== $user->id && !$user->is_admin) {
            throw new Exception('Unauthorized to update this request', 403);
        }

        $oldStatus = $request->status;
        $request->status()->associate($status);
        $request->save();

        Log::info('Request status updated', [
            'request_id' => $request->id,
            'user_id' => $user->id,
            'old_status' => $oldStatus->status_code,
            'new_status' => $statusCode
        ]);

        return [
            'request' => $request,
            'status' => $status->only(['status_code', 'status_label'])
        ];
    }

    /**
     * Delete request with validation
     */
    public function deleteRequest(int $requestId, User $user): bool
    {
        $request = $this->findRequest($requestId, $user);
        
        if (!$request) {
            throw new Exception('Request not found', 404);
        }

        // Check ownership
        if ($request->user_id !== $user->id) {
            throw new Exception('Unauthorized to delete this request', 403);
        }

        // Check if can be deleted (only draft status)
        if ($request->status->status_code !== 'draft') {
            throw new Exception('Only draft requests can be deleted', 422);
        }

        $deleted = $request->delete();

        if ($deleted) {
            Log::info('Request deleted', [
                'request_id' => $requestId,
                'user_id' => $user->id,
                'title' => $request->request_data?->capacity_development_title ?? 'N/A'
            ]);
        }

        return $deleted;
    }

    /**
     * Get active offer for a request
     */
    public function getActiveOffer(int $requestId): ?RequestOffer
    {
        return RequestOffer::with('documents')
            ->where('request_id', $requestId)
            ->where('status', RequestOfferStatus::ACTIVE)
            ->first();
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
     * Search requests with filters
     */
    public function searchRequests(array $filters, User $user): Collection
    {
        $query = OCDRequest::with('status');

        // Apply filters
        if (isset($filters['status'])) {
            $query->whereHas('status', function (Builder $q) use ($filters) {
                $q->where('status_code', $filters['status']);
            });
        }

        if (isset($filters['activity_type'])) {
            $query->whereRaw("JSON_EXTRACT(request_data, '$.related_activity') = ?", [$filters['activity_type']]);
        }

        if (isset($filters['subtheme'])) {
            $query->whereRaw("JSON_CONTAINS(JSON_EXTRACT(request_data, '$.subthemes'), ?)", [json_encode($filters['subtheme'])]);
        }

        // Filter by user ownership
        if (isset($filters['user_requests']) && $filters['user_requests']) {
            $query->where('user_id', $user->id);
        } else {
            // Public requests (exclude user's own)
            $query->where('user_id', '!=', $user->id);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get request actions based on user and request status
     */
    public function getRequestActions(OCDRequest $request, User $user): array
    {
        $isOwner = $request->user_id === $user->id;
        $isDraft = $request->status->status_code === 'draft';
        $hasActiveOffer = $this->getActiveOffer($request->id) !== null;

        return [
            'canEdit' => $isOwner && $isDraft,
            'canDelete' => $isOwner && $isDraft,
            'canView' => true,
            'canCreate' => false,
            'canExpressInterest' => !$isOwner,
            'canChangeStatus' => $user->is_admin,
            'canPreview' => true,
            'canExportPdf' => true,
            'canAcceptOffer' => $hasActiveOffer && $isOwner,
            'canRequestClarificationForOffer' => $hasActiveOffer && $isOwner,
        ];
    }

    /**
     * Get request for PDF export
     */
    public function getRequestForExport(int $requestId, User $user): ?OCDRequest
    {
        $request = OCDRequest::with(['status', 'user'])->find($requestId);
        
        if (!$request) {
            return null;
        }

        // Check if user can export this request
        if ($request->user_id !== $user->id && !$user->is_admin) {
            return null;
        }

        return $request;
    }

    /**
     * Get request title from request data
     */
    public function getRequestTitle(OCDRequest $request): string
    {
        return $request->request_data?->capacity_development_title ?? 'N/A';
    }
}
