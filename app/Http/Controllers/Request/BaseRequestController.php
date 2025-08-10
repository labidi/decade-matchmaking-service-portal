<?php

namespace App\Http\Controllers\Request;

use App\Http\Controllers\Controller;
use App\Models\Request\Status;
use App\Services\RequestService;
use App\Traits\HasBreadcrumbs;
use Illuminate\Http\Request;

/**
 * Base controller for all request-related operations
 *
 * Provides common functionality for both admin and user contexts:
 * - Route context detection (admin vs user routes)
 * - Common filter building and pagination
 * - Context-aware response handling
 * - Breadcrumb generation
 */
abstract class BaseRequestController extends Controller
{
    use HasBreadcrumbs;

    public function __construct(
        protected readonly RequestService $service
    ) {
    }

    /**
     * Detect if current route is an admin route
     */
    protected function isAdminRoute(): bool
    {
        return str_starts_with(request()->route()->getName() ?? '', 'admin.');
    }

    /**
     * Get the view prefix based on route context
     */
    protected function getViewPrefix(): string
    {
        return $this->isAdminRoute() ? 'Admin/' : '';
    }

    /**
     * Get available statuses for filtering
     */
    protected function getAvailableStatuses()
    {
        return Status::select('id', 'status_code', 'status_label')
            ->orderBy('status_label')
            ->get();
    }

    /**
     * Build common filters from request parameters
     */
    protected function buildFilters(Request $request): array
    {
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $searchUser = $request->get('user');
        $searchTitle = $request->get('title');

        return [
            'search' => array_filter([
                'user' => $searchUser,
                'title' => $searchTitle,
            ]),
            'sort' => [
                'field' => $sortField,
                'order' => $sortOrder,
                'per_page' => 10,
            ],
            'current' => [
                'sort' => ['field' => $sortField, 'order' => $sortOrder],
                'search' => ['user' => $searchUser ?? '', 'title' => $searchTitle ?? ''],
            ]
        ];
    }

    /**
     * Apply pagination parameters to paginated data
     */
    protected function applyPaginationParams($paginatedData, Request $request): void
    {
        $paginatedData->appends($request->only(['sort', 'order', 'user', 'title']));
    }

    /**
     * Build context-aware breadcrumbs for request operations
     */
    protected function buildContextualRequestBreadcrumbs(string $action, ?int $requestId = null): array
    {
        return $this->buildRequestBreadcrumbs($action, $requestId, $this->isAdminRoute());
    }

    /**
     * Get success response based on context
     *
     * Admin routes typically redirect to list page
     * User/API routes may return JSON responses
     */
    protected function getSuccessResponse(string $message, ?string $redirectRoute = null)
    {
        if ($this->isAdminRoute() && $redirectRoute) {
            return to_route($redirectRoute)->with('success', $message);
        }

        // Default JSON response for non-admin routes
        return response()->json(['message' => $message]);
    }

    /**
     * Get error response based on context
     */
    protected function getErrorResponse(string $message, int $statusCode = 400, ?string $redirectRoute = null)
    {
        if ($this->isAdminRoute() && $redirectRoute) {
            return to_route($redirectRoute)->with('error', $message);
        }

        // Default JSON response for non-admin routes
        return response()->json(['error' => $message], $statusCode);
    }

    /**
     * Get the appropriate list route for redirects
     */
    protected function getListRoute(): string
    {
        return $this->isAdminRoute() ? 'admin.request.list' : 'request.me.list';
    }

    /**
     * Get the appropriate show route
     */
    protected function getShowRoute(int $requestId): string
    {
        if ($this->isAdminRoute()) {
            return route('admin.request.show', ['request' => $requestId]);
        }

        return route('request.show', ['id' => $requestId]);
    }

    /**
     * Get context-appropriate view data for list operations
     */
    protected function getListViewData(string $title, $requests, array $filters, array $additional = []): array
    {
        $baseData = [
            'title' => $title,
            'requests' => $requests,
            'currentSort' => $filters['current']['sort'],
            'currentSearch' => $filters['current']['search'],
            'breadcrumbs' => $this->buildContextualRequestBreadcrumbs('list'),
        ];

        // Add admin-specific data
        if ($this->isAdminRoute()) {
            $baseData['availableStatuses'] = $this->getAvailableStatuses();
        }

        return array_merge($baseData, $additional);
    }

    /**
     * Get context-appropriate view data for show operations
     */
    protected function getShowViewData(string $title, $request, ?int $requestId = null, array $additional = []): array
    {
        $baseData = [
            'title' => $title,
            'request' => $request,
            'breadcrumbs' => $this->buildContextualRequestBreadcrumbs('show', $requestId),
        ];

        return array_merge($baseData, $additional);
    }

    /**
     * Handle common status update validation
     */
    protected function validateStatusUpdate(Request $request): array
    {
        return $request->validate([
            'status_code' => 'required|string|exists:request_statuses,status_code',
        ]);
    }

    /**
     * Handle status update with context-aware response
     */
    protected function handleStatusUpdate(Request $request, int $requestId): mixed
    {
        try {
            $validated = $this->validateStatusUpdate($request);

            $result = $this->service->updateRequestStatus(
                $requestId,
                $validated['status_code'],
                $request->user()
            );

            $message = 'Request status updated successfully';

            if ($this->isAdminRoute()) {
                return $this->getSuccessResponse($message, 'admin.request.list');
            }

            // For non-admin routes, return JSON with updated status
            return response()->json([
                'message' => $message,
                'status' => $result['request']->status
            ]);

        } catch (\Exception $e) {
            $statusCode = $e->getCode() ?: 500;

            if ($this->isAdminRoute()) {
                return $this->getErrorResponse($e->getMessage(), $statusCode, 'admin.request.list');
            }

            return response()->json(['error' => $e->getMessage()], $statusCode);
        }
    }
}
